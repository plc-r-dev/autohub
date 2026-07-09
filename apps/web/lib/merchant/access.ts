import { prisma } from "@/lib/prisma";

export const MERCHANT_ACCESS_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  NONE: "none",
} as const;

export type MerchantAccessStatus =
  (typeof MERCHANT_ACCESS_STATUS)[keyof typeof MERCHANT_ACCESS_STATUS];

export type MerchantAccessState = {
  status: MerchantAccessStatus;
  merchantId: string | null;
};

export async function getMerchantAccessState(
  domainUserId: string,
): Promise<MerchantAccessState> {
  const user = await prisma.user.findUnique({
    where: { id: domainUserId },
    select: {
      merchantId: true,
      merchantClaims: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
      merchantOnboardingRequests: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      status: MERCHANT_ACCESS_STATUS.NONE,
      merchantId: null,
    };
  }

  if (user.merchantId) {
    return {
      status: MERCHANT_ACCESS_STATUS.APPROVED,
      merchantId: user.merchantId,
    };
  }

  if (
    user.merchantClaims.length > 0 ||
    user.merchantOnboardingRequests.length > 0
  ) {
    return {
      status: MERCHANT_ACCESS_STATUS.PENDING,
      merchantId: null,
    };
  }

  return {
    status: MERCHANT_ACCESS_STATUS.NONE,
    merchantId: null,
  };
}

export function isMerchantUser(state: MerchantAccessState): boolean {
  return state.status !== MERCHANT_ACCESS_STATUS.NONE;
}

export function isApprovedMerchant(state: MerchantAccessState): boolean {
  return state.status === MERCHANT_ACCESS_STATUS.APPROVED;
}

export function isPendingMerchant(state: MerchantAccessState): boolean {
  return state.status === MERCHANT_ACCESS_STATUS.PENDING;
}
