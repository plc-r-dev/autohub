import { prisma } from "@/lib/prisma";

export const SERVICE_STORE_ACCESS_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  NONE: "none",
} as const;

export type ServiceStoreAccessStatus =
  (typeof SERVICE_STORE_ACCESS_STATUS)[keyof typeof SERVICE_STORE_ACCESS_STATUS];

export type ServiceStoreAccessState = {
  status: ServiceStoreAccessStatus;
  serviceStoreId: string | null;
  membershipCount: number;
};

export async function getServiceStoreAccessState(
  domainUserId: string,
): Promise<ServiceStoreAccessState> {
  const user = await prisma.user.findUnique({
    where: { id: domainUserId },
    select: {
      serviceStoreId: true,
      serviceStoreMembers: {
        select: { serviceStoreId: true },
        orderBy: { createdAt: "asc" },
      },
      serviceStoreClaims: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
      serviceStoreOnboardingRequests: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.NONE,
      serviceStoreId: null,
      membershipCount: 0,
    };
  }

  const membershipCount = user.serviceStoreMembers.length;
  const activeServiceStoreId =
    user.serviceStoreId && user.serviceStoreMembers.some((m) => m.serviceStoreId === user.serviceStoreId)
      ? user.serviceStoreId
      : (user.serviceStoreMembers[0]?.serviceStoreId ?? null);

  if (membershipCount > 0 && activeServiceStoreId) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.APPROVED,
      serviceStoreId: activeServiceStoreId,
      membershipCount,
    };
  }

  if (
    user.serviceStoreClaims.length > 0 ||
    user.serviceStoreOnboardingRequests.length > 0
  ) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.PENDING,
      serviceStoreId: null,
      membershipCount: 0,
    };
  }

  return {
    status: SERVICE_STORE_ACCESS_STATUS.NONE,
    serviceStoreId: null,
    membershipCount: 0,
  };
}

export function isServiceStoreUser(state: ServiceStoreAccessState): boolean {
  return state.status !== SERVICE_STORE_ACCESS_STATUS.NONE;
}

export function isApprovedServiceStore(state: ServiceStoreAccessState): boolean {
  return state.status === SERVICE_STORE_ACCESS_STATUS.APPROVED;
}

export function isPendingServiceStore(state: ServiceStoreAccessState): boolean {
  return state.status === SERVICE_STORE_ACCESS_STATUS.PENDING;
}
