import { redirect } from "next/navigation";
import { isIdentityLinked } from "@/lib/auth/identity";
import { PORTALS } from "@/lib/auth/portals";
import { requireCustomerIdentity, requireServiceStoreSession } from "@/lib/auth/require-identity";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { prisma } from "@/lib/prisma";

/** Customer domain user — auto-provisions Customer profile from LINE session. */
export async function requireDomainUser() {
  const { session, identity } = await requireCustomerIdentity();

  const user = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      id: true,
      authUserId: true,
      lineUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      tenantId: true,
      serviceStoreId: true,
    },
  });

  if (!user) {
    redirect(PORTALS.customer.home);
  }

  return { session, identity, user };
}

/** Service Store domain user — does not require or create a Customer profile. */
export async function requireServiceStoreDomainUser() {
  const { session, identity } = await requireServiceStoreSession();

  if (!isIdentityLinked(identity)) {
    redirect(PORTALS.serviceStore.onboarding);
  }

  const user = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      id: true,
      authUserId: true,
      lineUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      tenantId: true,
      serviceStoreId: true,
    },
  });

  if (!user) {
    redirect(PORTALS.serviceStore.onboarding);
  }

  return { session, identity, user };
}

export async function requireApprovedServiceStoreUser() {
  return requireServiceStoreContext();
}
