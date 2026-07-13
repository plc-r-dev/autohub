import { prisma } from "@/lib/prisma";
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
  role: ServiceStoreMemberRole;
  serviceStore: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  primaryBranchName: string | null;
  todaysBookings: number;
  todaysRevenue: number;
};

/** Per-membership summary for the Workspace Home store grid — today's bookings/revenue snapshot. */
export async function listServiceStoreWorkspaceSummaries(
  userId: string,
): Promise<ServiceStoreWorkspaceSummary[]> {
  const memberships = await listUserServiceStoreMemberships(userId);
  if (memberships.length === 0) {
    return [];
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return Promise.all(
    memberships.map(async (membership) => {
      const serviceStoreId = membership.serviceStore.id;
      const [primaryBranch, todaysBookings, todaysRevenueRaw] = await Promise.all([
        prisma.branch.findFirst({
          where: { serviceStoreId },
          orderBy: { createdAt: "asc" },
          select: { name: true },
        }),
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
      ]);

      return {
        role: membership.role,
        serviceStore: membership.serviceStore,
        primaryBranchName: primaryBranch?.name ?? null,
        todaysBookings,
        todaysRevenue: Number(todaysRevenueRaw._sum.unitPrice ?? 0),
      };
    }),
  );
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
