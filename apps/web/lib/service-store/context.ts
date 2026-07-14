import { redirect } from "next/navigation";
import {
  getServiceStoreMembership,
  listUserServiceStoreMemberships,
} from "@/lib/service-store/application/member-queries";
import {
  roleHasPermission,
  type ServiceStorePermission,
} from "@/lib/service-store/domain";
import { PORTALS } from "@/lib/auth/portals";
import { requireServiceStoreDomainUser } from "@/lib/auth/domain-user";
import type { ServiceStore, ServiceStoreMemberRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ServiceStoreContext = {
  session: Awaited<ReturnType<typeof requireServiceStoreDomainUser>>["session"];
  identity: Awaited<ReturnType<typeof requireServiceStoreDomainUser>>["identity"];
  user: Awaited<ReturnType<typeof requireServiceStoreDomainUser>>["user"];
  serviceStore: ServiceStore;
  membership: {
    id: string;
    role: ServiceStoreMemberRole;
    userId: string;
    serviceStoreId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

async function resolveActiveServiceStoreId(
  userId: string,
  preferredId: string | null,
) {
  const memberships = await listUserServiceStoreMemberships(userId)
  if (memberships.length === 0) {
    return null
  }

  // Single store: always use it (auto-select).
  if (memberships.length === 1) {
    return memberships[0]!.serviceStore.id
  }

  // Multi-store: only an explicitly persisted preference enters the portal.
  if (preferredId) {
    const match = memberships.find((row) => row.serviceStore.id === preferredId)
    if (match) {
      return preferredId
    }
  }

  return null
}

export type RequireServiceStoreContextOptions = {
  /** Allow access while store is still in ONBOARDING setup (setup wizard / team invite). */
  allowOnboarding?: boolean;
};

export async function requireServiceStoreContext(
  permission?: ServiceStorePermission,
  options?: RequireServiceStoreContextOptions,
): Promise<ServiceStoreContext> {
  const { session, identity, user } = await requireServiceStoreDomainUser();

  const activeServiceStoreId = await resolveActiveServiceStoreId(user.id, user.serviceStoreId);

  if (!activeServiceStoreId) {
    const memberships = await listUserServiceStoreMemberships(user.id)
    if (memberships.length > 1) {
      redirect(PORTALS.serviceStore.chooseStore)
    }

    const pendingClaim = await prisma.serviceStoreClaim.count({
      where: { userId: user.id, status: "PENDING" },
    })
    const pendingRequest = await prisma.serviceStoreOnboardingRequest.count({
      where: { userId: user.id, status: "PENDING" },
    })

    if (pendingClaim > 0 || pendingRequest > 0) {
      redirect(PORTALS.serviceStore.waiting)
    }
    redirect(PORTALS.serviceStore.onboarding)
  }

  if (user.serviceStoreId !== activeServiceStoreId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { serviceStoreId: activeServiceStoreId },
    });
  }

  const membership = await getServiceStoreMembership(user.id, activeServiceStoreId);
  if (!membership) {
    redirect(PORTALS.serviceStore.onboarding);
  }

  const serviceStore = await prisma.serviceStore.findUnique({
    where: { id: activeServiceStoreId },
  });

  if (!serviceStore) {
    redirect(PORTALS.serviceStore.onboarding);
  }

  if (permission && !roleHasPermission(membership.role, permission)) {
    redirect(PORTALS.serviceStore.dashboard);
  }

  return {
    session,
    identity,
    user,
    serviceStore,
    membership: {
      id: membership.id,
      role: membership.role,
      userId: membership.userId,
      serviceStoreId: membership.serviceStoreId,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    },
  };
}

export async function listAccessibleServiceStores(userId: string) {
  return listUserServiceStoreMemberships(userId);
}
