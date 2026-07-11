import { prisma } from "@/lib/prisma";
import {
  BANGKOK_CENTER,
  DEFAULT_NEARBY_RADIUS_KM,
  haversineDistanceKm,
} from "@/lib/geo/distance";
import {
  toMarketplaceBookingPresentation,
  type MarketplaceBookingPresentation,
  type MarketplaceServiceStoreFacts,
} from "@/lib/marketplace/booking-availability";
import { evaluateServiceStoreReadiness } from "@/lib/service-store/domain";
import { buildBookingWizardHref } from "@/lib/booking/wizard";

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
  members: {
    where: { role: "OWNER" },
    select: { id: true },
  },
  branches: {
    select: {
      id: true,
      latitude: true,
      longitude: true,
      operatingHours: {
        select: { isClosed: true },
      },
      services: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  },
} as const;

/** Customer browse: all active serviceStores (claimed and unclaimed). */
const browseServiceStoreWhere = {
  status: { in: ["ACTIVE", "READY_FOR_BOOKING"] as Array<"ACTIVE" | "READY_FOR_BOOKING"> },
};

type MarketplaceServiceStoreRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  status: MarketplaceServiceStoreFacts["status"];
  tenant: { name: string; code?: string };
  claims: Array<{ status: "PENDING" | "APPROVED" | "REJECTED" }>;
  members: Array<{ id: string }>;
  branches: Array<{
    id: string;
    latitude: { toString(): string } | null;
    longitude: { toString(): string } | null;
    operatingHours: Array<{ isClosed: boolean }>;
    services: Array<{ id: string }>;
  }>;
};

function toFacts(row: MarketplaceServiceStoreRow): MarketplaceServiceStoreFacts {
  const branchesWithServices = row.branches.filter((branch) => branch.services.length > 0);
  const activeBranchCount = branchesWithServices.length;
  const activeServiceCount = branchesWithServices.reduce(
    (total, branch) => total + branch.services.length,
    0,
  );
  const branchesWithOpenHoursCount = branchesWithServices.filter((branch) =>
    branch.operatingHours.some((hour) => !hour.isClosed),
  ).length;

  const readiness = evaluateServiceStoreReadiness({
    status: row.status,
    ownerCount: row.members.length,
    branchCount: row.branches.length,
    activeServiceCount,
    branchesWithOpenHoursCount,
    hasContactInfo: Boolean(row.phone?.trim() || row.email?.trim()),
  });

  return {
    status: row.status,
    hasApprovedClaim: row.claims.some((claim) => claim.status === "APPROVED"),
    hasPendingClaim: row.claims.some((claim) => claim.status === "PENDING"),
    hasOwnerMember: row.members.length > 0,
    activeBranchCount,
    activeServiceCount,
    readinessStatus: readiness.status,
  };
}

function resolveBookHref(row: MarketplaceServiceStoreRow): string {
  const firstBranch = row.branches.find((branch) => branch.services.length > 0);
  const firstService = firstBranch?.services[0];

  if (!firstBranch || !firstService) {
    return `/browse/${row.id}`;
  }

  return buildBookingWizardHref({
    serviceStoreId: row.id,
    branchId: firstBranch.id,
    serviceId: firstService.id,
    step: "vehicle",
  });
}

export type MarketplaceServiceStoreListItem = {
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
  row: MarketplaceServiceStoreRow,
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
  row: MarketplaceServiceStoreRow,
  refLat: number,
  refLng: number,
): MarketplaceServiceStoreListItem {
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

type BrowseServiceStoreListParams = {
  q?: string;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
  nearby?: boolean;
  refLat?: number;
  refLng?: number;
  nearbyRadiusKm?: number;
};

function sortBrowseServiceStores(
  items: MarketplaceServiceStoreListItem[],
  sort: "asc" | "desc",
  nearby: boolean,
): MarketplaceServiceStoreListItem[] {
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

/** Customer browse: all active serviceStores. */
export async function listBrowseServiceStores() {
  const rows = await prisma.serviceStore.findMany({
    where: browseServiceStoreWhere,
    select: marketplaceListSelect,
    orderBy: { name: "asc" },
  });

  const items = rows.map((row) =>
    toListItem(row as MarketplaceServiceStoreRow, BANGKOK_CENTER.lat, BANGKOK_CENTER.lng),
  );

  return sortBrowseServiceStores(items, "asc", false);
}

export async function listBrowseServiceStoresPaginated(params: BrowseServiceStoreListParams) {
  const where = {
    ...browseServiceStoreWhere,
    ...buildSearchWhere(params.q),
  };

  const refLat = params.refLat ?? BANGKOK_CENTER.lat;
  const refLng = params.refLng ?? BANGKOK_CENTER.lng;
  const nearbyRadiusKm = params.nearbyRadiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const nearby = params.nearby ?? false;

  const rows = await prisma.serviceStore.findMany({
    where,
    select: marketplaceListSelect,
    orderBy: { name: params.sort },
  });

  let items = rows.map((row) => toListItem(row as MarketplaceServiceStoreRow, refLat, refLng));

  if (nearby) {
    items = items.filter(
      (item) => item.distanceKm != null && item.distanceKm <= nearbyRadiusKm,
    );
  }

  items = sortBrowseServiceStores(items, params.sort, nearby);

  const totalCount = items.length;
  const start = (params.page - 1) * params.pageSize;
  const pageRows = items.slice(start, start + params.pageSize);

  return {
    totalCount,
    rows: pageRows,
  };
}

export type MarketplaceServiceStoreDetail = MarketplaceServiceStoreListItem & {
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

export async function getBrowseServiceStore(
  serviceStoreId: string,
): Promise<MarketplaceServiceStoreDetail | null> {
  const row = await prisma.serviceStore.findFirst({
    where: { id: serviceStoreId },
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
          operatingHours: {
            select: { isClosed: true },
          },
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
    row as MarketplaceServiceStoreRow,
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
  serviceStore: {
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
  serviceStoreId: string,
  branchId: string,
): Promise<MarketplaceBranchDetail | null> {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      serviceStoreId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      phone: true,
      address: true,
      serviceStore: {
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

  const serviceStoreItem = toListItem(
    branch.serviceStore as MarketplaceServiceStoreRow,
    BANGKOK_CENTER.lat,
    BANGKOK_CENTER.lng,
  );

  return {
    id: branch.id,
    code: branch.code,
    name: branch.name,
    phone: branch.phone,
    address: branch.address,
    serviceStore: {
      id: serviceStoreItem.id,
      name: serviceStoreItem.name,
      code: serviceStoreItem.code,
      hasApprovedClaim: serviceStoreItem.hasApprovedClaim,
      booking: serviceStoreItem.booking,
    },
    services: branch.services,
  };
}

export async function getServiceStoreBookingFactsByBranchId(branchId: string) {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      serviceStore: {
        select: marketplaceListSelect,
      },
    },
  });

  if (!branch) {
    return null;
  }

  return toFacts(branch.serviceStore as MarketplaceServiceStoreRow);
}
