"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getDefaultOperatingHours } from "@/lib/booking/engine/time";
import { sendServiceStoreApproved } from "@/lib/line/line-notification-service";
import { prisma } from "@/lib/prisma";

export type ServiceStoreRequestActionState = {
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

export async function approveServiceStoreClaim(
  claimId: string,
): Promise<ServiceStoreRequestActionState> {
  let notificationTarget: { lineUserId: string | null; serviceStoreName: string } | null = null;
  try {
    await assertRequestManager();

    notificationTarget = await prisma.$transaction(async (tx) => {
      const claim = await tx.serviceStoreClaim.findUnique({
        where: { id: claimId },
        select: {
          id: true,
          status: true,
          userId: true,
          googlePlaceId: true,
          businessCategory: true,
          proposedName: true,
          proposedPhone: true,
          proposedEmail: true,
          proposedWebsite: true,
          proposedDescription: true,
          proposedAddress: true,
          proposedLatitude: true,
          proposedLongitude: true,
          serviceStore: {
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

      await tx.serviceStoreClaim.update({
        where: { id: claim.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: claim.userId },
        data: {
          serviceStoreId: claim.serviceStore.id,
          tenantId: claim.serviceStore.tenantId,
        },
      });

      await tx.serviceStoreMember.upsert({
        where: {
          serviceStoreId_userId: {
            serviceStoreId: claim.serviceStore.id,
            userId: claim.userId,
          },
        },
        create: {
          serviceStoreId: claim.serviceStore.id,
          userId: claim.userId,
          role: "OWNER",
        },
        update: {
          role: "OWNER",
        },
      });

      await tx.serviceStore.update({
        where: { id: claim.serviceStore.id },
        data: {
          name: claim.proposedName ?? undefined,
          phone: claim.proposedPhone ?? undefined,
          email: claim.proposedEmail ?? undefined,
          website: claim.proposedWebsite ?? undefined,
          description: claim.proposedDescription ?? undefined,
          googlePlaceId: claim.googlePlaceId ?? undefined,
          businessCategory: claim.businessCategory ?? undefined,
          status: "ONBOARDING",
          bookingEnabled: false,
        },
      });

      const existingBranch = await tx.branch.findFirst({
        where: { serviceStoreId: claim.serviceStore.id },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (existingBranch) {
        await tx.branch.update({
          where: { id: existingBranch.id },
          data: {
            name: claim.proposedName ?? undefined,
            phone: claim.proposedPhone ?? undefined,
            address: claim.proposedAddress ?? undefined,
            latitude: claim.proposedLatitude ?? undefined,
            longitude: claim.proposedLongitude ?? undefined,
          },
        });
      } else if (claim.proposedAddress) {
        const branch = await tx.branch.create({
          data: {
            serviceStoreId: claim.serviceStore.id,
            code: "main",
            name: claim.proposedName ?? "Main branch",
            phone: claim.proposedPhone,
            address: claim.proposedAddress,
            latitude: claim.proposedLatitude,
            longitude: claim.proposedLongitude,
          },
        });
        await tx.branchOperatingHours.createMany({
          data: getDefaultOperatingHours().map((hours) => ({
            branchId: branch.id,
            ...hours,
          })),
        });
      }

      const user = await tx.user.findUnique({
        where: { id: claim.userId },
        select: { lineUserId: true },
      });
      const serviceStore = await tx.serviceStore.findUnique({
        where: { id: claim.serviceStore.id },
        select: { name: true },
      });
      if (serviceStore) {
        return {
          lineUserId: user?.lineUserId ?? null,
          serviceStoreName: serviceStore.name,
        };
      }
      return null;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CLAIM_NOT_PENDING") {
      return { error: "This claim is no longer pending." };
    }

    return { error: "Unable to approve serviceStore claim." };
  }

  revalidatePath("/admin/service-store-requests");
  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/pending-approval");

  if (notificationTarget) {
    await sendServiceStoreApproved({
      recipientLineUserId: notificationTarget.lineUserId,
      serviceStoreName: notificationTarget.serviceStoreName,
    });
  }

  return { success: "Service Store claim approved." };
}

export async function rejectServiceStoreClaim(
  claimId: string,
): Promise<ServiceStoreRequestActionState> {
  try {
    await assertRequestManager();

    const claim = await prisma.serviceStoreClaim.findUnique({
      where: { id: claimId },
      select: { id: true, status: true },
    });

    if (!claim || claim.status !== "PENDING") {
      return { error: "This claim is no longer pending." };
    }

    await prisma.serviceStoreClaim.update({
      where: { id: claim.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });
  } catch {
    return { error: "Unable to reject serviceStore claim." };
  }

  revalidatePath("/admin/service-store-requests");
  revalidatePath("/pending-approval");

  return { success: "Service Store claim rejected." };
}

export async function approveServiceStoreOnboardingRequest(
  requestId: string,
): Promise<ServiceStoreRequestActionState> {
  let notificationTarget: { lineUserId: string | null; serviceStoreName: string } | null = null;
  try {
    await assertRequestManager();

    notificationTarget = await prisma.$transaction(async (tx) => {
      const request = await tx.serviceStoreOnboardingRequest.findUnique({
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

      const existingServiceStore = await tx.serviceStore.findFirst({
        where: {
          tenantId: request.tenantId,
          code: request.businessCode,
        },
        select: { id: true },
      });

      if (existingServiceStore) {
        throw new Error("BUSINESS_CODE_EXISTS");
      }

      const serviceStore = await tx.serviceStore.create({
        data: {
          tenantId: request.tenantId,
          code: request.businessCode,
          name: request.businessName,
          description: request.description,
          phone: request.phone,
          email: request.email,
          website: request.website,
          status: "ONBOARDING",
          bookingEnabled: false,
        },
      });

      const branch = await tx.branch.create({
        data: {
          serviceStoreId: serviceStore.id,
          code: "main",
          name: request.businessName,
          phone: request.phone,
        },
      });

      await tx.branchOperatingHours.createMany({
        data: getDefaultOperatingHours().map((hours) => ({
          branchId: branch.id,
          ...hours,
        })),
      });

      await tx.serviceStoreOnboardingRequest.update({
        where: { id: request.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: {
          serviceStoreId: serviceStore.id,
          tenantId: request.tenantId,
        },
      });

      await tx.serviceStoreMember.upsert({
        where: {
          serviceStoreId_userId: {
            serviceStoreId: serviceStore.id,
            userId: request.userId,
          },
        },
        create: {
          serviceStoreId: serviceStore.id,
          userId: request.userId,
          role: "OWNER",
        },
        update: {
          role: "OWNER",
        },
      });

      const user = await tx.user.findUnique({
        where: { id: request.userId },
        select: { lineUserId: true },
      });
      return {
        lineUserId: user?.lineUserId ?? null,
        serviceStoreName: serviceStore.name,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REQUEST_NOT_PENDING") {
        return { error: "This onboarding request is no longer pending." };
      }
      if (error.message === "BUSINESS_CODE_EXISTS") {
        return { error: "A serviceStore with this business code already exists." };
      }
    }

    return { error: "Unable to approve serviceStore onboarding request." };
  }

  revalidatePath("/admin/service-store-requests");
  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/pending-approval");

  if (notificationTarget) {
    await sendServiceStoreApproved({
      recipientLineUserId: notificationTarget.lineUserId,
      serviceStoreName: notificationTarget.serviceStoreName,
    });
  }

  return { success: "Service Store onboarding request approved." };
}

export async function rejectServiceStoreOnboardingRequest(
  requestId: string,
): Promise<ServiceStoreRequestActionState> {
  try {
    await assertRequestManager();

    const request = await prisma.serviceStoreOnboardingRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!request || request.status !== "PENDING") {
      return { error: "This onboarding request is no longer pending." };
    }

    await prisma.serviceStoreOnboardingRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });
  } catch {
    return { error: "Unable to reject serviceStore onboarding request." };
  }

  revalidatePath("/admin/service-store-requests");
  revalidatePath("/pending-approval");

  return { success: "Service Store onboarding request rejected." };
}
