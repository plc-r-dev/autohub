"use server";

import { redirect } from "next/navigation";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
import { getLineUserId } from "@/lib/onboarding/context";
import {
  customerOnboardingSchema,
  merchantOnboardingSchema,
} from "@/lib/onboarding/schemas";
import { searchMerchants } from "@/lib/onboarding/queries";
import { prisma } from "@/lib/prisma";

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

async function assertUnlinkedAuthUser(authUserId: string) {
  const identity = await resolveIdentityLink(authUserId);
  if (isIdentityLinked(identity)) {
    redirect("/dashboard");
  }
}

async function assertTenantExists(tenantId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error("Selected tenant is not available");
  }
}

export async function completeCustomerOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  await assertUnlinkedAuthUser(session.user.id);

  const parsed = customerOnboardingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    await assertTenantExists(input.tenantId);

    const lineUserId = await getLineUserId(session.user.id);

    if (lineUserId) {
      const existingLineUser = await prisma.user.findUnique({
        where: { lineUserId },
        select: { id: true },
      });
      if (existingLineUser) {
        return { error: "This LINE account is already linked to another profile." };
      }
    }

    if (input.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingEmailUser) {
        return { error: "This email is already in use." };
      }
    }

    if (lineUserId) {
      const existingLineCustomer = await prisma.customer.findUnique({
        where: { lineUserId },
        select: { id: true },
      });
      if (existingLineCustomer) {
        return { error: "This LINE account is already linked to a customer profile." };
      }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          authUserId: session.user.id,
          lineUserId,
          tenantId: input.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
        },
      });

      await tx.customer.create({
        data: {
          userId: user.id,
          tenantId: input.tenantId,
          lineUserId,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
        },
      });
    });
  } catch {
    return { error: "Unable to complete customer onboarding. Please try again." };
  }

  redirect("/dashboard");
}

export async function completeMerchantOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  await assertUnlinkedAuthUser(session.user.id);

  const parsed = merchantOnboardingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    await assertTenantExists(input.tenantId);

    const lineUserId = await getLineUserId(session.user.id);

    if (lineUserId) {
      const existingLineUser = await prisma.user.findUnique({
        where: { lineUserId },
        select: { id: true },
      });
      if (existingLineUser) {
        return { error: "This LINE account is already linked to another profile." };
      }
    }

    if (input.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingEmailUser) {
        return { error: "This email is already in use." };
      }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          authUserId: session.user.id,
          lineUserId,
          tenantId: input.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
        },
      });

      if (input.mode === "claim") {
        const merchant = await tx.merchant.findFirst({
          where: {
            id: input.merchantId,
            tenantId: input.tenantId,
          },
          select: { id: true },
        });

        if (!merchant) {
          throw new Error("MERCHANT_NOT_FOUND");
        }

        const existingClaim = await tx.merchantClaim.findFirst({
          where: {
            merchantId: input.merchantId,
            userId: user.id,
            status: "PENDING",
          },
          select: { id: true },
        });

        if (existingClaim) {
          throw new Error("CLAIM_EXISTS");
        }

        await tx.merchantClaim.create({
          data: {
            merchantId: input.merchantId,
            userId: user.id,
          },
        });
      } else {
        const existingMerchantCode = await tx.merchant.findFirst({
          where: {
            tenantId: input.tenantId,
            code: input.businessCode,
          },
          select: { id: true },
        });

        if (existingMerchantCode) {
          throw new Error("BUSINESS_CODE_EXISTS");
        }

        await tx.merchantOnboardingRequest.create({
          data: {
            userId: user.id,
            tenantId: input.tenantId,
            businessName: input.businessName,
            businessCode: input.businessCode,
            description: input.description,
            phone: input.businessPhone,
            email: input.businessEmail,
            website: input.website,
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MERCHANT_NOT_FOUND") {
        return { error: "The selected business could not be found." };
      }
      if (error.message === "CLAIM_EXISTS") {
        return { error: "You already have a pending claim for this business." };
      }
      if (error.message === "BUSINESS_CODE_EXISTS") {
        return { error: "This business code is already taken in the selected tenant." };
      }
    }

    return { error: "Unable to complete merchant onboarding. Please try again." };
  }

  redirect("/merchant/waiting");
}

export async function searchMerchantsAction(tenantId: string, query: string) {
  const session = await getServerSession();
  if (!session) {
    return [];
  }

  await assertUnlinkedAuthUser(session.user.id);

  if (!tenantId) {
    return [];
  }

  return searchMerchants(tenantId, query);
}
