import { prisma } from "@/lib/prisma";

export const IDENTITY_LINK_STATUS = {
  LINKED: "linked",
  UNLINKED: "unlinked",
} as const;

export type IdentityLinkStatus =
  (typeof IDENTITY_LINK_STATUS)[keyof typeof IDENTITY_LINK_STATUS];

/** Entry points for onboarding flows. */
export const ONBOARDING_TARGET = {
  MERCHANT: "serviceStore",
  CUSTOMER: "customer",
} as const;

export type OnboardingTarget =
  (typeof ONBOARDING_TARGET)[keyof typeof ONBOARDING_TARGET];

export type IdentityLink = {
  status: IdentityLinkStatus;
  domainUserId: string | null;
};

export async function resolveIdentityLink(
  authUserId: string,
): Promise<IdentityLink> {
  const domainUser = await prisma.user.findUnique({
    where: { authUserId },
    select: { id: true },
  });

  if (domainUser) {
    return {
      status: IDENTITY_LINK_STATUS.LINKED,
      domainUserId: domainUser.id,
    };
  }

  return {
    status: IDENTITY_LINK_STATUS.UNLINKED,
    domainUserId: null,
  };
}

export function isIdentityLinked(identity: IdentityLink): boolean {
  return identity.status === IDENTITY_LINK_STATUS.LINKED;
}
