"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { sendMerchantApproved } from "@/lib/line/line-notification-service";
import { prisma } from "@/lib/prisma";

export type MerchantRequestActionState = {
  error?: string;
  success?: string;
};

async function assertRequestManager() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const identity = await resolveIdentityLink(session.user.id);
  if (!isIdentityLinked(identity)) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function approveMerchantClaim(
  claimId: string,
): Promise<MerchantRequestActionState> {
  let notificationTarget: { lineUserId: string | null; merchantName: string } | null = null;
  try {
    await assertRequestManager();

    notificationTarget = await prisma.$transaction(async (tx) => {
      const claim = await tx.merchantClaim.findUnique({
        where: { id: claimId },
        select: {
          id: true,
          status: true,
          userId: true,
          merchant: {
            select: {
              id: true,
              tenantId: true,
            },
          },
        },
      });

      if (!claim || claim.status !== "PENDING") {
        throw new Error("CLAIM_NOT_PENDING");
      }

      await tx.merchantClaim.update({
        where: { id: claim.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: claim.userId },
        data: {
          merchantId: claim.merchant.id,
          tenantId: claim.merchant.tenantId,
        },
      });

      await tx.merchant.update({
        where: { id: claim.merchant.id },
        data: {
          status: "ACTIVE",
          bookingEnabled: true,
        },
      });

      const user = await tx.user.findUnique({
        where: { id: claim.userId },
        select: { lineUserId: true },
      });
      const merchant = await tx.merchant.findUnique({
        where: { id: claim.merchant.id },
        select: { name: true },
      });
      if (merchant) {
        return {
          lineUserId: user?.lineUserId ?? null,
          merchantName: merchant.name,
        };
      }
      return null;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CLAIM_NOT_PENDING") {
      return { error: "This claim is no longer pending." };
    }

    return { error: "Unable to approve merchant claim." };
  }

  revalidatePath("/admin/merchant-requests");
  revalidatePath("/merchant");
  revalidatePath("/merchant/dashboard");
  revalidatePath("/merchant/waiting");

  if (notificationTarget) {
    await sendMerchantApproved({
      recipientLineUserId: notificationTarget.lineUserId,
      merchantName: notificationTarget.merchantName,
    });
  }

  return { success: "Merchant claim approved." };
}

export async function rejectMerchantClaim(
  claimId: string,
): Promise<MerchantRequestActionState> {
  try {
    await assertRequestManager();

    const claim = await prisma.merchantClaim.findUnique({
      where: { id: claimId },
      select: { id: true, status: true },
    });

    if (!claim || claim.status !== "PENDING") {
      return { error: "This claim is no longer pending." };
    }

    await prisma.merchantClaim.update({
      where: { id: claim.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });
  } catch {
    return { error: "Unable to reject merchant claim." };
  }

  revalidatePath("/admin/merchant-requests");
  revalidatePath("/merchant/waiting");

  return { success: "Merchant claim rejected." };
}

export async function approveMerchantOnboardingRequest(
  requestId: string,
): Promise<MerchantRequestActionState> {
  let notificationTarget: { lineUserId: string | null; merchantName: string } | null = null;
  try {
    await assertRequestManager();

    notificationTarget = await prisma.$transaction(async (tx) => {
      const request = await tx.merchantOnboardingRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          userId: true,
          tenantId: true,
          businessName: true,
          businessCode: true,
          description: true,
          phone: true,
          email: true,
          website: true,
        },
      });

      if (!request || request.status !== "PENDING") {
        throw new Error("REQUEST_NOT_PENDING");
      }

      const existingMerchant = await tx.merchant.findFirst({
        where: {
          tenantId: request.tenantId,
          code: request.businessCode,
        },
        select: { id: true },
      });

      if (existingMerchant) {
        throw new Error("BUSINESS_CODE_EXISTS");
      }

      const merchant = await tx.merchant.create({
        data: {
          tenantId: request.tenantId,
          code: request.businessCode,
          name: request.businessName,
          description: request.description,
          phone: request.phone,
          email: request.email,
          website: request.website,
          status: "ACTIVE",
          bookingEnabled: true,
        },
      });

      await tx.merchantOnboardingRequest.update({
        where: { id: request.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: {
          merchantId: merchant.id,
          tenantId: request.tenantId,
        },
      });

      const user = await tx.user.findUnique({
        where: { id: request.userId },
        select: { lineUserId: true },
      });
      return {
        lineUserId: user?.lineUserId ?? null,
        merchantName: merchant.name,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REQUEST_NOT_PENDING") {
        return { error: "This onboarding request is no longer pending." };
      }
      if (error.message === "BUSINESS_CODE_EXISTS") {
        return { error: "A merchant with this business code already exists." };
      }
    }

    return { error: "Unable to approve merchant onboarding request." };
  }

  revalidatePath("/admin/merchant-requests");
  revalidatePath("/merchant");
  revalidatePath("/merchant/dashboard");
  revalidatePath("/merchant/waiting");

  if (notificationTarget) {
    await sendMerchantApproved({
      recipientLineUserId: notificationTarget.lineUserId,
      merchantName: notificationTarget.merchantName,
    });
  }

  return { success: "Merchant onboarding request approved." };
}

export async function rejectMerchantOnboardingRequest(
  requestId: string,
): Promise<MerchantRequestActionState> {
  try {
    await assertRequestManager();

    const request = await prisma.merchantOnboardingRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!request || request.status !== "PENDING") {
      return { error: "This onboarding request is no longer pending." };
    }

    await prisma.merchantOnboardingRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });
  } catch {
    return { error: "Unable to reject merchant onboarding request." };
  }

  revalidatePath("/admin/merchant-requests");
  revalidatePath("/merchant/waiting");

  return { success: "Merchant onboarding request rejected." };
}
