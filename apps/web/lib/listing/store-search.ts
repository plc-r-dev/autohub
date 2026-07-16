import type { ServiceStoreStatus } from "@/lib/generated/prisma/client";
import { getStoreDisplayRating } from "@/lib/booking/customer-display";

/** Car-care search synonyms — token → expanded phrases. */
const SYNONYM_MAP: Readonly<Record<string, readonly string[]>> = {
  wash: ["car wash", "carwash", "washing", "clean", "cleaning", "ล้าง"],
  station: ["shop", "store", "center", "centre", "garage"],
  detail: ["detailing", "polish", "wax"],
  oil: ["lube", "lubricant", "change"],
  car: ["auto", "vehicle", "รถ"],
  service: ["maintenance", "repair", "care"],
  wax: ["polish", "coating"],
  tire: ["tyre", "wheel"],
};

const STATUS_RANK: Record<ServiceStoreStatus, number> = {
  ACTIVE: 3,
  READY_FOR_BOOKING: 2,
  ONBOARDING: 1,
  DRAFT: 0,
  PENDING_VERIFICATION: 0,
  SUSPENDED: 0,
};

export type StoreSearchMatchType = "exact_phrase" | "token" | "synonym" | "fuzzy";

export type StoreSearchRelevance = {
  score: number;
  matchedTokens: number;
  totalTokens: number;
  matchType: StoreSearchMatchType;
};

export type StoreSearchableFields = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ServiceStoreStatus;
  tenantName: string;
  branchNames: string[];
  serviceNames: string[];
};

const MIN_TOKEN_LENGTH = 2;
const FUZZY_THRESHOLD = 0.55;

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const tokens = normalized
    .split(/[\s,./\-_]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= MIN_TOKEN_LENGTH);

  return [...new Set(tokens)];
}

export function expandSearchTokens(tokens: string[]): {
  primary: string[];
  synonyms: string[];
} {
  const primary = [...tokens];
  const synonyms: string[] = [];

  for (const token of tokens) {
    const expansions = SYNONYM_MAP[token];
    if (expansions) {
      for (const phrase of expansions) {
        synonyms.push(normalizeText(phrase));
      }
    }
  }

  return {
    primary,
    synonyms: [...new Set(synonyms)],
  };
}

/** Prisma `OR` fragments for token + synonym candidate retrieval. */
export function buildTokenSearchOrClauses(tokens: string[]) {
  const { primary, synonyms } = expandSearchTokens(tokens);
  const allTerms = [...new Set([...primary, ...synonyms])];

  if (allTerms.length === 0) {
    return [];
  }

  return allTerms.flatMap((term) => [
    { name: { contains: term, mode: "insensitive" as const } },
    { code: { contains: term, mode: "insensitive" as const } },
    { description: { contains: term, mode: "insensitive" as const } },
    { tenant: { name: { contains: term, mode: "insensitive" as const } } },
    {
      branches: {
        some: {
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            {
              services: {
                some: { name: { contains: term, mode: "insensitive" as const } },
              },
            },
          ],
        },
      },
    },
  ]);
}

export function extractSearchableFields(
  row: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: ServiceStoreStatus;
    tenant: { name: string };
    branches: Array<{
      name: string;
      services: Array<{ name: string }>;
    }>;
  },
): StoreSearchableFields {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
    tenantName: row.tenant.name,
    branchNames: row.branches.map((b) => b.name),
    serviceNames: row.branches.flatMap((b) => b.services.map((s) => s.name)),
  };
}

export function scoreStoreSearchRelevance(
  fields: StoreSearchableFields,
  query: string,
  tokens: string[],
): StoreSearchRelevance {
  const normalizedQuery = normalizeText(query);
  const searchableTexts = collectSearchableTexts(fields);
  const combinedText = searchableTexts.join(" ");

  let score = 0;
  let matchedTokens = 0;
  let matchType: StoreSearchMatchType = "fuzzy";

  if (normalizedQuery && combinedText.includes(normalizedQuery)) {
    score += 1_000;
    matchType = "exact_phrase";
    matchedTokens = tokens.length;
  }

  for (const token of tokens) {
    let tokenMatched = false;

    for (const text of searchableTexts) {
      const norm = normalizeText(text);
      if (!norm) continue;

      if (norm === token) {
        score += 120;
        tokenMatched = true;
        if (matchType === "fuzzy") matchType = "token";
      } else if (norm.startsWith(token)) {
        score += 80;
        tokenMatched = true;
        if (matchType === "fuzzy") matchType = "token";
      } else if (norm.includes(token)) {
        score += 40;
        tokenMatched = true;
        if (matchType === "fuzzy") matchType = "token";
      }
    }

    if (tokenMatched) matchedTokens += 1;
  }

  const { synonyms } = expandSearchTokens(tokens);
  for (const synonym of synonyms) {
    if (combinedText.includes(synonym)) {
      score += 20;
      if (matchType === "fuzzy") matchType = "synonym";
    }
  }

  score += matchedTokens * 50;
  score += STATUS_RANK[fields.status] * 10;

  const rating = Number.parseFloat(getStoreDisplayRating(fields.id).rating);
  if (Number.isFinite(rating)) {
    score += rating * 2;
  }

  if (matchedTokens === 0 && normalizedQuery) {
    const fuzzyBest = Math.max(
      ...searchableTexts.map((text) =>
        bigramSimilarity(normalizedQuery, normalizeText(text)),
      ),
      0,
    );
    if (fuzzyBest >= FUZZY_THRESHOLD) {
      score += Math.round(fuzzyBest * 30);
      matchType = "fuzzy";
    }
  }

  return {
    score,
    matchedTokens,
    totalTokens: tokens.length,
    matchType,
  };
}

export function rankBySearchRelevance<T extends { searchRelevance?: StoreSearchRelevance }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = a.searchRelevance?.score ?? 0;
    const scoreB = b.searchRelevance?.score ?? 0;
    if (scoreA !== scoreB) return scoreB - scoreA;

    const tokensA = a.searchRelevance?.matchedTokens ?? 0;
    const tokensB = b.searchRelevance?.matchedTokens ?? 0;
    if (tokensA !== tokensB) return tokensB - tokensA;

    return 0;
  });
}

function collectSearchableTexts(fields: StoreSearchableFields): string[] {
  return [
    fields.name,
    fields.code,
    fields.description ?? "",
    fields.tenantName,
    ...fields.branchNames,
    ...fields.serviceNames,
  ].filter((value) => value.trim().length > 0);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function bigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const bigramsA = toBigrams(a);
  const bigramsB = toBigrams(b);
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const gram of bigramsA) {
    if (bigramsB.has(gram)) intersection += 1;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

function toBigrams(value: string): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i < value.length - 1; i += 1) {
    grams.add(value.slice(i, i + 2));
  }
  return grams;
}
