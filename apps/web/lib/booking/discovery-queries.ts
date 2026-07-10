import { prisma } from "@/lib/prisma";
import {
  BANGKOK_CENTER,
  DEFAULT_NEARBY_RADIUS_KM,
  haversineDistanceKm,
} from "@/lib/geo/distance";
import {
  toMarketplaceBookingPresentation,
  type MarketplaceBookingPresentation,
  type MarketplaceMerchantFacts,
} from "@/lib/marketplace/booking-availability";

const marketplaceListSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  phone: true,
  email: true,
  status: true,
  tenant: {
    select: { name: true, code: true },
  },
  claims: {
    select: { status: true },
  },
  branches: {
    select: {
      id: true,
      latitude: true,
      longitude: true,
      services: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  },
} as const;

/** Customer browse: all active merchants (claimed and unclaimed). */
const browseMerchantWhere = {
  status: "ACTIVE" as const,
};

type MarketplaceMerchantRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  status: MarketplaceMerchantFacts["status"];
  tenant: { name: string; code?: string };
  claims: Array<{ status: "PENDING" | "APPROVED" | "REJECTED" }>;
  branches: Array<{
    id: string;
    latitude: { toString(): string } | null;
    longitude: { toString(): string } | null;
    services: Array<{ id: string }>;
  }>;
};

function toFacts(row: MarketplaceMerchantRow): MarketplaceMerchantFacts {
  const activeBranchCount = row.branches.filter(
    (branch) => branch.services.length > 0,
  ).length;
  const activeServiceCount = row.branches.reduce(
    (total, branch) => total + branch.services.length,
    0,
  );

  return {
    status: row.status,
    hasApprovedClaim: row.claims.some((claim) => claim.status === "APPROVED"),
    hasPendingClaim: row.claims.some((claim) => claim.status === "PENDING"),
    activeBranchCount,
    activeServiceCount,
  };
}

function resolveBookHref(row: MarketplaceMerchantRow): string {
  const firstBranch = row.branches.find((branch) => branch.services.length > 0);
  const firstService = firstBranch?.services[0];

  if (!firstBranch || !firstService) {
    return `/browse/${row.id}`;
  }

  return `/bookings/new?branchId=${firstBranch.id}&serviceId=${firstService.id}`;
}

export type MarketplaceMerchantListItem = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  tenant: { name: string; code?: string };
  branchCount: number;
  bookHref: string;
  hasApprovedClaim: boolean;
  distanceKm: number | null;
  booking: MarketplaceBookingPresentation;
};

function computeMinBranchDistanceKm(
  row: MarketplaceMerchantRow,
  refLat: number,
  refLng: number,
): number | null {
  const distances = row.branches
    .map((branch) => {
      if (branch.latitude == null || branch.longitude == null) {
        return null;
      }
      const lat = Number(branch.latitude.toString());
      const lng = Number(branch.longitude.toString());
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return haversineDistanceKm(refLat, refLng, lat, lng);
    })
    .filter((value): value is number => value != null);

  if (distances.length === 0) {
    return null;
  }

  return Math.min(...distances);
}

function toListItem(
  row: MarketplaceMerchantRow,
  refLat: number,
  refLng: number,
): MarketplaceMerchantListItem {
  const facts = toFacts(row);
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    phone: row.phone,
    email: row.email,
    tenant: row.tenant,
    branchCount: row.branches.length,
    bookHref: resolveBookHref(row),
    hasApprovedClaim: facts.hasApprovedClaim,
    distanceKm: computeMinBranchDistanceKm(row, refLat, refLng),
    booking: toMarketplaceBookingPresentation(facts),
  };
}

type BrowseMerchantListParams = {
  q?: string;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
  nearby?: boolean;
  refLat?: number;
  refLng?: number;
  nearbyRadiusKm?: number;
};

function sortBrowseMerchants(
  items: MarketplaceMerchantListItem[],
  sort: "asc" | "desc",
  nearby: boolean,
): MarketplaceMerchantListItem[] {
  return [...items].sort((a, b) => {
    if (a.hasApprovedClaim !== b.hasApprovedClaim) {
      return a.hasApprovedClaim ? -1 : 1;
    }

    if (nearby && a.distanceKm != null && b.distanceKm != null && a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }

    const byName = a.name.localeCompare(b.name);
    return sort === "asc" ? byName : -byName;
  });
}

function buildSearchWhere(keyword?: string) {
  const trimmed = keyword?.trim();
  if (!trimmed) {
    return {};
  }

  return {
    OR: [
      { name: { contains: trimmed, mode: "insensitive" as const } },
      { code: { contains: trimmed, mode: "insensitive" as const } },
      { description: { contains: trimmed, mode: "insensitive" as const } },
      { tenant: { name: { contains: trimmed, mode: "insensitive" as const } } },
    ],
  };
}

/** Customer browse: all active merchants. */
export async function listBrowseMerchants() {
  const rows = await prisma.merchant.findMany({
    where: browseMerchantWhere,
    select: marketplaceListSelect,
    orderBy: { name: "asc" },
  });

  const items = rows.map((row) =>
    toListItem(row as MarketplaceMerchantRow, BANGKOK_CENTER.lat, BANGKOK_CENTER.lng),
  );

  return sortBrowseMerchants(items, "asc", false);
}

export async function listBrowseMerchantsPaginated(params: BrowseMerchantListParams) {
  const where = {
    ...browseMerchantWhere,
    ...buildSearchWhere(params.q),
  };

  const refLat = params.refLat ?? BANGKOK_CENTER.lat;
  const refLng = params.refLng ?? BANGKOK_CENTER.lng;
  const nearbyRadiusKm = params.nearbyRadiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const nearby = params.nearby ?? false;

  const rows = await prisma.merchant.findMany({
    where,
    select: marketplaceListSelect,
    orderBy: { name: params.sort },
  });

  let items = rows.map((row) => toListItem(row as MarketplaceMerchantRow, refLat, refLng));

  if (nearby) {
    items = items.filter(
      (item) => item.distanceKm != null && item.distanceKm <= nearbyRadiusKm,
    );
  }

  items = sortBrowseMerchants(items, params.sort, nearby);

  const totalCount = items.length;
  const start = (params.page - 1) * params.pageSize;
  const pageRows = items.slice(start, start + params.pageSize);

  return {
    totalCount,
    rows: pageRows,
  };
}

export type MarketplaceMerchantDetail = MarketplaceMerchantListItem & {
  website: string | null;
  branches: Array<{
    id: string;
    code: string;
    name: string;
    phone: string | null;
    address: string | null;
    services: Array<{ id: string }>;
  }>;
};

export async function getBrowseMerchant(
  merchantId: string,
): Promise<MarketplaceMerchantDetail | null> {
  const row = await prisma.merchant.findFirst({
    where: { id: merchantId },
    select: {
      ...marketplaceListSelect,
      website: true,
      branches: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          services: {
            where: { isActive: true },
            select: { id: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!row) {
    return null;
  }

  const listItem = toListItem(
    row as MarketplaceMerchantRow,
    BANGKOK_CENTER.lat,
    BANGKOK_CENTER.lng,
  );
  return {
    ...listItem,
    website: row.website,
    branches: row.branches,
  };
}

export type MarketplaceBranchDetail = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
  merchant: {
    id: string;
    name: string;
    code: string;
    hasApprovedClaim: boolean;
    booking: MarketplaceBookingPresentation;
  };
  services: Array<{
    id: string;
    code: string;
    name: string;
    duration: number;
    bufferMinutes: number;
    price: { toString(): string };
  }>;
};

export async function getBrowseBranch(
  merchantId: string,
  branchId: string,
): Promise<MarketplaceBranchDetail | null> {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      merchantId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      phone: true,
      address: true,
      merchant: {
        select: marketplaceListSelect,
      },
      services: {
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          duration: true,
          bufferMinutes: true,
          price: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!branch) {
    return null;
  }

  const merchantItem = toListItem(
    branch.merchant as MarketplaceMerchantRow,
    BANGKOK_CENTER.lat,
    BANGKOK_CENTER.lng,
  );

  return {
    id: branch.id,
    code: branch.code,
    name: branch.name,
    phone: branch.phone,
    address: branch.address,
    merchant: {
      id: merchantItem.id,
      name: merchantItem.name,
      code: merchantItem.code,
      hasApprovedClaim: merchantItem.hasApprovedClaim,
      booking: merchantItem.booking,
    },
    services: branch.services,
  };
}

export async function getMerchantBookingFactsByBranchId(branchId: string) {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      merchant: {
        select: marketplaceListSelect,
      },
    },
  });

  if (!branch) {
    return null;
  }

  return toFacts(branch.merchant as MarketplaceMerchantRow);
}
