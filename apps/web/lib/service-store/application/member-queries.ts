import { prisma } from "@/lib/prisma";
import { resolveMediaPreviewUrl } from "@/lib/storage/media-upload";
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";

export type ServiceStoreMembershipSummary = {
  serviceStoreId: string;
  serviceStoreName: string;
  serviceStoreCode: string;
  role: ServiceStoreMemberRole;
};

export async function listUserServiceStoreMemberships(userId: string) {
  return prisma.serviceStoreMember.findMany({
    where: { userId },
    select: {
      role: true,
      serviceStore: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },
    },
    orderBy: { serviceStore: { name: "asc" } },
  });
}

export type ServiceStoreWorkspaceSummary = {
  role: ServiceStoreMemberRole
  serviceStore: {
    id: string
    name: string
    code: string
    status: string
    logoUrl: string | null
  }
  primaryBranchName: string | null
  branchCount: number
  todaysBookings: number
  todaysRevenue: number
}

/** Per-membership summary for the store selection grid. */
export async function listServiceStoreWorkspaceSummaries(
  userId: string,
): Promise<ServiceStoreWorkspaceSummary[]> {
  const memberships = await listUserServiceStoreMemberships(userId)
  if (memberships.length === 0) {
    return []
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  return Promise.all(
    memberships.map(async (membership) => {
      const serviceStoreId = membership.serviceStore.id
      const [store, primaryBranch, branchCount, todaysBookings, todaysRevenueRaw] =
        await Promise.all([
          prisma.serviceStore.findUnique({
            where: { id: serviceStoreId },
            select: { logoKey: true },
          }),
          prisma.branch.findFirst({
            where: { serviceStoreId },
            orderBy: { createdAt: "asc" },
            select: { name: true },
          }),
          prisma.branch.count({ where: { serviceStoreId } }),
          prisma.booking.count({
            where: {
              branch: { serviceStoreId },
              bookingDate: { gte: todayStart, lte: todayEnd },
            },
          }),
          prisma.bookingItem.aggregate({
            where: {
              booking: {
                branch: { serviceStoreId },
                status: "COMPLETED",
                completedAt: { gte: todayStart, lte: todayEnd },
              },
            },
            _sum: { unitPrice: true },
          }),
        ])

      return {
        role: membership.role,
        serviceStore: {
          ...membership.serviceStore,
          logoUrl: await resolveMediaPreviewUrl(store?.logoKey),
        },
        primaryBranchName: primaryBranch?.name ?? null,
        branchCount,
        todaysBookings,
        todaysRevenue: Number(todaysRevenueRaw._sum.unitPrice ?? 0),
      }
    }),
  )
}

/** Pending claim / create applications shown on the store selection grid. */
export type PendingServiceStoreApplication = {
  id: string
  type: "claim" | "create"
  name: string
  code: string | null
  branchCount: number
  logoUrl: string | null
}

export async function listPendingServiceStoreApplications(
  userId: string,
): Promise<PendingServiceStoreApplication[]> {
  const [claims, requests] = await Promise.all([
    prisma.serviceStoreClaim.findMany({
      where: { userId, status: "PENDING" },
      select: {
        id: true,
        proposedName: true,
        serviceStore: {
          select: {
            name: true,
            code: true,
            logoKey: true,
            _count: { select: { branches: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.serviceStoreOnboardingRequest.findMany({
      where: { userId, status: "PENDING" },
      select: {
        id: true,
        businessName: true,
        businessCode: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ])

  const claimCards = await Promise.all(
    claims.map(async (claim) => ({
      id: claim.id,
      type: "claim" as const,
      name: claim.proposedName?.trim() || claim.serviceStore.name,
      code: claim.serviceStore.code,
      branchCount: claim.serviceStore._count.branches,
      logoUrl: await resolveMediaPreviewUrl(claim.serviceStore.logoKey),
    })),
  )

  const createCards: PendingServiceStoreApplication[] = requests.map(
    (request) => ({
      id: request.id,
      type: "create",
      name: request.businessName,
      code: request.businessCode,
      branchCount: 0,
      logoUrl: null,
    }),
  )

  return [...claimCards, ...createCards]
}

export async function getServiceStoreMembership(userId: string, serviceStoreId: string) {
  return prisma.serviceStoreMember.findUnique({
    where: {
      serviceStoreId_userId: {
        serviceStoreId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
      userId: true,
      serviceStoreId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          lineUserId: true,
        },
      },
    },
  });
}

export async function listServiceStoreMembers(serviceStoreId: string) {
  return prisma.serviceStoreMember.findMany({
    where: { serviceStoreId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          lineUserId: true,
          status: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function countServiceStoreOwners(serviceStoreId: string) {
  return prisma.serviceStoreMember.count({
    where: { serviceStoreId, role: "OWNER" },
  });
}
