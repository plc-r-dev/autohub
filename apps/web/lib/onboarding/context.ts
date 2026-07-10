import { redirect } from "next/navigation";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isPendingMerchant,
} from "@/lib/merchant/access";
import { prisma } from "@/lib/prisma";

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

/** Merchant portal onboarding — uses the same domain user as the customer profile when present. */
export async function requireMerchantOnboardingContext(): Promise<OnboardingContext> {
  const session = await getServerSession();
  if (!session) {
    redirect("/merchant/login?callbackUrl=/merchant/onboarding");
  }

  const identity = await resolveIdentityLink(session.user.id);
  if (isIdentityLinked(identity) && identity.domainUserId) {
    const merchantAccess = await getMerchantAccessState(identity.domainUserId);
    if (isApprovedMerchant(merchantAccess)) {
      redirect("/merchant/dashboard");
    }
    if (isPendingMerchant(merchantAccess)) {
      redirect("/merchant/waiting");
    }
    // Linked customer without merchant profile — continue onboarding on same identity.
  }

  const lineUserId = await getLineUserId(session.user.id);

  return {
    authUserId: session.user.id,
    authUserName: session.user.name,
    authUserEmail: session.user.email,
    lineUserId,
  };
}
