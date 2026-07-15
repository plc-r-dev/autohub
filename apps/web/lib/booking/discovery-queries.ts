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
import { resolveMediaPreviewUrl } from "@/lib/storage/media-upload";

const marketplaceListSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  phone: true,
  email: true,
  status: true,
  bookingEnabled: true,
  logoKey: true,
  coverImageKey: true,
  galleryImageKeys: true,
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
  payoutBankName: true,
  payoutAccountName: true,
  payoutAccountNumber: true,
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

/** Customer browse: discoverable shops (incl. claimed stores still finishing catalog). */
const browseServiceStoreWhere = {
  status: {
    in: ["ACTIVE", "READY_FOR_BOOKING", "ONBOARDING"] as Array<
      "ACTIVE" | "READY_FOR_BOOKING" | "ONBOARDING"
    >,
  },
};

type MarketplaceServiceStoreRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  status: MarketplaceServiceStoreFacts["status"];
  bookingEnabled: boolean;
  logoKey: string | null;
  coverImageKey: string | null;
  galleryImageKeys: string[];
  tenant: { name: string; code?: string };
  claims: Array<{ status: "PENDING" | "APPROVED" | "REJECTED" }>;
  members: Array<{ id: string }>;
  payoutBankName: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
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
  const branchesWithOpenHoursCount = row.branches.filter((branch) =>
    branch.operatingHours.some((hour) => !hour.isClosed),
  ).length;

  const readiness = evaluateServiceStoreReadiness({
    status: row.status,
    ownerCount: row.members.length,
    branchCount: row.branches.length,
    activeServiceCount,
    branchesWithOpenHoursCount,
    hasContactInfo: Boolean(row.phone?.trim() || row.email?.trim()),
    hasPaymentAccount: Boolean(
      row.payoutBankName?.trim() &&
        row.payoutAccountName?.trim() &&
        row.payoutAccountNumber?.trim(),
    ),
  });

  return {
    status: row.status,
    bookingEnabled: row.bookingEnabled,
    hasApprovedClaim: row.claims.some((claim) => claim.status === "APPROVED"),
    hasPendingClaim: row.claims.some((claim) => claim.status === "PENDING"),
    hasOwnerMember: row.members.length > 0,
    activeBranchCount,
    activeServiceCount,
    readinessStatus: readiness.status,
  };
}

function resolveBookHref(
  row: MarketplaceServiceStoreRow,
  bookable: boolean,
): string {
  if (!bookable) {
    return `/browse/${row.id}`;
  }

  const firstBranch = row.branches.find((branch) => branch.services.length > 0);
  const firstService = firstBranch?.services[0];

  if (!firstBranch || !firstService) {
    return `/browse/${row.id}`;
  }

  return buildBookingWizardHref({
    serviceStoreId: row.id,
    branchId: firstBranch.id,
    serviceId: firstService.id,
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
  imageUrl: string | null;
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

async function toListItem(
  row: MarketplaceServiceStoreRow,
  refLat: number,
  refLng: number,
): Promise<MarketplaceServiceStoreListItem> {
  const facts = toFacts(row);
  const booking = toMarketplaceBookingPresentation(facts);
  const [logoUrl, coverImageUrl, firstGalleryUrl] = await Promise.all([
    resolveMediaPreviewUrl(row.logoKey),
    resolveMediaPreviewUrl(row.coverImageKey),
    resolveMediaPreviewUrl(row.galleryImageKeys[0]),
  ]);

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    phone: row.phone,
    email: row.email,
    tenant: row.tenant,
    branchCount: row.branches.length,
    bookHref: resolveBookHref(row, booking.bookable),
    hasApprovedClaim: facts.hasApprovedClaim || facts.hasOwnerMember,
    distanceKm: computeMinBranchDistanceKm(row, refLat, refLng),
    imageUrl: coverImageUrl ?? firstGalleryUrl ?? logoUrl,
    booking,
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

  const items = await Promise.all(
    rows.map((row) =>
      toListItem(
        row as MarketplaceServiceStoreRow,
        BANGKOK_CENTER.lat,
        BANGKOK_CENTER.lng,
      ),
    ),
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

  let items = await Promise.all(
    rows.map((row) =>
      toListItem(row as MarketplaceServiceStoreRow, refLat, refLng),
    ),
  );

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
  galleryImages: Array<{ src: string; alt: string }>;
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

  const listItem = await toListItem(
    row as MarketplaceServiceStoreRow,
    BANGKOK_CENTER.lat,
    BANGKOK_CENTER.lng,
  );

  const galleryImages = (
    await Promise.all(
      row.galleryImageKeys.map(async (key, index) => {
        const src = await resolveMediaPreviewUrl(key);
        if (!src) return null;
        return {
          src,
          alt: `${row.name} photo ${index + 1}`,
        };
      }),
    )
  ).filter((image): image is { src: string; alt: string } => image != null);

  return {
    ...listItem,
    website: row.website,
    galleryImages,
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

  const serviceStoreItem = await toListItem(
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
