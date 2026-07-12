import { redirect } from "next/navigation";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
} from "@/lib/service-store/access";
import { prisma } from "@/lib/prisma";

async function resolveApprovedRedirect(domainUserId: string) {
  const access = await getServiceStoreAccessState(domainUserId);
  if (!isApprovedServiceStore(access) || !access.serviceStoreId) {
    return null;
  }

  if (access.membershipCount > 1) {
    return "/choose-store";
  }

  const store = await prisma.serviceStore.findUnique({
    where: { id: access.serviceStoreId },
    select: { status: true },
  });

  if (store?.status === "ONBOARDING") {
    return "/app/setup";
  }

  return "/app/dashboard";
}

export type OnboardingContext = {
  authUserId: string;
  authUserName: string;
  authUserEmail: string;
  lineUserId: string | null;
};

export async function getLineUserId(authUserId: string): Promise<string | null> {
  const account = await prisma.authAccount.findFirst({
    where: {
      userId: authUserId,
      providerId: "line",
    },
    select: {
      accountId: true,
    },
  });

  return account?.accountId ?? null;
}

export async function requireOnboardingContext(): Promise<OnboardingContext> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const identity = await resolveIdentityLink(session.user.id);
  if (isIdentityLinked(identity)) {
    redirect("/browse");
  }

  const lineUserId = await getLineUserId(session.user.id);

  return {
    authUserId: session.user.id,
    authUserName: session.user.name,
    authUserEmail: session.user.email,
    lineUserId,
  };
}

/** ServiceStore portal onboarding — uses the same domain user as the customer profile when present. */
export async function requireServiceStoreOnboardingContext(): Promise<OnboardingContext> {
  const session = await getServerSession();
  if (!session) {
    redirect("/app/login?callbackUrl=/app/onboarding");
  }

  const identity = await resolveIdentityLink(session.user.id);
  if (isIdentityLinked(identity) && identity.domainUserId) {
    const serviceStoreAccess = await getServiceStoreAccessState(identity.domainUserId);
    if (isApprovedServiceStore(serviceStoreAccess)) {
      const target = await resolveApprovedRedirect(identity.domainUserId);
      if (target) {
        redirect(target);
      }
    }
    if (isPendingServiceStore(serviceStoreAccess)) {
      redirect("/pending-approval");
    }
    // Linked customer without serviceStore profile — continue onboarding on same identity.
  }

  const lineUserId = await getLineUserId(session.user.id);

  return {
    authUserId: session.user.id,
    authUserName: session.user.name,
    authUserEmail: session.user.email,
    lineUserId,
  };
}
