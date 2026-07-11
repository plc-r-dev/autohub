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
