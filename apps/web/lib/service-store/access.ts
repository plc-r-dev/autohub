import { prisma } from "@/lib/prisma"
import { PORTALS } from "@/lib/auth/portals"

export const SERVICE_STORE_ACCESS_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  NONE: "none",
} as const

export type ServiceStoreAccessStatus =
  (typeof SERVICE_STORE_ACCESS_STATUS)[keyof typeof SERVICE_STORE_ACCESS_STATUS]

export type ServiceStoreAccessState = {
  status: ServiceStoreAccessStatus
  /** Persisted active store; null means multi-store user must pick one. */
  serviceStoreId: string | null
  membershipCount: number
}

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
  })

  if (!user) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.NONE,
      serviceStoreId: null,
      membershipCount: 0,
    }
  }

  const membershipIds = user.serviceStoreMembers.map((m) => m.serviceStoreId)
  const membershipCount = membershipIds.length

  if (membershipCount === 1) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.APPROVED,
      serviceStoreId: membershipIds[0]!,
      membershipCount,
    }
  }

  if (membershipCount > 1) {
    const preferred =
      user.serviceStoreId && membershipIds.includes(user.serviceStoreId)
        ? user.serviceStoreId
        : null
    return {
      status: SERVICE_STORE_ACCESS_STATUS.APPROVED,
      serviceStoreId: preferred,
      membershipCount,
    }
  }

  if (
    user.serviceStoreClaims.length > 0 ||
    user.serviceStoreOnboardingRequests.length > 0
  ) {
    return {
      status: SERVICE_STORE_ACCESS_STATUS.PENDING,
      serviceStoreId: null,
      membershipCount: 0,
    }
  }

  return {
    status: SERVICE_STORE_ACCESS_STATUS.NONE,
    serviceStoreId: null,
    membershipCount: 0,
  }
}

export function isServiceStoreUser(state: ServiceStoreAccessState): boolean {
  return state.status !== SERVICE_STORE_ACCESS_STATUS.NONE
}

export function isApprovedServiceStore(state: ServiceStoreAccessState): boolean {
  return state.status === SERVICE_STORE_ACCESS_STATUS.APPROVED
}

export function isPendingServiceStore(state: ServiceStoreAccessState): boolean {
  return state.status === SERVICE_STORE_ACCESS_STATUS.PENDING
}

/**
 * After auth, approved users land on store selection (`/app`) so they can
 * Open an existing store, Claim, or Create — including when they only have one.
 */
export function resolveApprovedServiceStoreDestination(
  _state: ServiceStoreAccessState,
): string {
  return PORTALS.serviceStore.home
}

/**
 * Single source of truth for the post-authentication ServiceStore routing decision.
 * `state` is null when the auth identity isn't linked to a domain user yet — treated as NONE.
 */
export function resolvePostAuthServiceStoreDestination(
  state: ServiceStoreAccessState | null,
): string {
  if (state && isApprovedServiceStore(state)) {
    return resolveApprovedServiceStoreDestination(state)
  }
  if (state && isPendingServiceStore(state)) {
    return PORTALS.serviceStore.waiting
  }
  return PORTALS.serviceStore.onboarding
}

/** Whether an approved user may enter portal modules (dashboard, bookings, …). */
export function canEnterServiceStorePortal(
  state: ServiceStoreAccessState,
): boolean {
  if (!isApprovedServiceStore(state)) return false
  if (state.membershipCount === 1) return true
  return Boolean(state.serviceStoreId)
}
