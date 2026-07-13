"use server";

import { redirect } from "next/navigation";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
import { getLineUserId } from "@/lib/onboarding/context";
import {
  customerOnboardingSchema,
  serviceStoreClaimSchema,
  serviceStoreCreateSchema,
  serviceStoreOnboardingSchema,
} from "@/lib/onboarding/schemas";
import { searchServiceStores } from "@/lib/onboarding/queries";
import { slugifyBusinessCode } from "@/lib/service-store/domain";
import { prisma } from "@/lib/prisma";

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

async function assertUnlinkedAuthUser(
  authUserId: string,
  linkedRedirect = "/browse",
) {
  const identity = await resolveIdentityLink(authUserId);
  if (isIdentityLinked(identity)) {
    redirect(linkedRedirect);
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

async function resolveDomainUserIdForServiceStoreOnboarding(
  authUserId: string,
  input: {
    tenantId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  },
): Promise<string> {
  const identity = await resolveIdentityLink(authUserId);

  if (isIdentityLinked(identity) && identity.domainUserId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: identity.domainUserId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    if (input.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingEmailUser && existingEmailUser.id !== existingUser.id) {
        throw new Error("EMAIL_IN_USE");
      }
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        tenantId: input.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
      },
    });

    return existingUser.id;
  }

  const lineUserId = await getLineUserId(authUserId);

  if (lineUserId) {
    const existingLineUser = await prisma.user.findUnique({
      where: { lineUserId },
      select: { id: true },
    });
    if (existingLineUser) {
      throw new Error("LINE_USER_IN_USE");
    }
  }

  if (input.email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existingEmailUser) {
      throw new Error("EMAIL_IN_USE");
    }
  }

  const user = await prisma.user.create({
    data: {
      authUserId,
      lineUserId,
      tenantId: input.tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
    },
    select: { id: true },
  });

  return user.id;
}

async function generateUniqueBusinessCode(tenantId: string, name: string) {
  const base = slugifyBusinessCode(name) || "service-store";
  let candidate = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.serviceStore.findFirst({
      where: { tenantId, code: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function mapOnboardingError(error: unknown): OnboardingActionState {
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
    if (error.message === "EMAIL_IN_USE") {
      return { error: "This email is already in use." };
    }
    if (error.message === "LINE_USER_IN_USE") {
      return { error: "This LINE account is already linked to another profile." };
    }
  }
  return { error: "Unable to complete onboarding. Please try again." };
}

export async function submitServiceStoreClaim(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  const parsed = serviceStoreClaimSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  try {
    await assertTenantExists(input.tenantId);

    const domainUserId = await resolveDomainUserIdForServiceStoreOnboarding(session.user.id, {
      tenantId: input.tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
    });

    await prisma.$transaction(async (tx) => {
      const serviceStore = await tx.serviceStore.findFirst({
        where: { id: input.serviceStoreId, tenantId: input.tenantId },
        select: { id: true },
      });

      if (!serviceStore) {
        throw new Error("MERCHANT_NOT_FOUND");
      }

      const existingClaim = await tx.serviceStoreClaim.findFirst({
        where: {
          serviceStoreId: input.serviceStoreId,
          userId: domainUserId,
          status: "PENDING",
        },
        select: { id: true },
      });

      if (existingClaim) {
        throw new Error("CLAIM_EXISTS");
      }

      await tx.serviceStoreClaim.create({
        data: {
          serviceStoreId: input.serviceStoreId,
          userId: domainUserId,
          googlePlaceId: input.googlePlaceId,
          businessCategory: input.businessCategory,
          proposedName: input.proposedName,
          proposedPhone: input.proposedPhone,
          proposedEmail: input.proposedEmail,
          proposedWebsite: input.proposedWebsite,
          proposedDescription: input.proposedDescription,
          proposedAddress: input.proposedAddress,
          proposedLatitude: input.proposedLatitude,
          proposedLongitude: input.proposedLongitude,
        },
      });
    });
  } catch (error) {
    return mapOnboardingError(error);
  }

  redirect("/app");
}

export async function createServiceStoreDirect(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  const parsed = serviceStoreCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  try {
    await assertTenantExists(input.tenantId);

    const domainUserId = await resolveDomainUserIdForServiceStoreOnboarding(session.user.id, {
      tenantId: input.tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
    });

    const businessCode = await generateUniqueBusinessCode(input.tenantId, input.businessName);
    const { getDefaultOperatingHours } = await import("@/lib/booking/engine/time");

    await prisma.$transaction(async (tx) => {
      const serviceStore = await tx.serviceStore.create({
        data: {
          tenantId: input.tenantId,
          code: businessCode,
          name: input.businessName,
          phone: input.businessPhone,
          email: input.businessEmail,
          website: input.website,
          description: input.description,
          googlePlaceId: input.googlePlaceId,
          businessCategory: input.businessCategory,
          status: "ONBOARDING",
          bookingEnabled: false,
        },
      });

      const branch = await tx.branch.create({
        data: {
          serviceStoreId: serviceStore.id,
          code: "main",
          name: input.businessName,
          phone: input.businessPhone,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });

      await tx.branchOperatingHours.createMany({
        data: getDefaultOperatingHours().map((hours) => ({
          branchId: branch.id,
          ...hours,
        })),
      });

      await tx.serviceStoreMember.create({
        data: {
          serviceStoreId: serviceStore.id,
          userId: domainUserId,
          role: "OWNER",
        },
      });

      await tx.user.update({
        where: { id: domainUserId },
        data: {
          serviceStoreId: serviceStore.id,
          tenantId: input.tenantId,
        },
      });
    });
  } catch (error) {
    return mapOnboardingError(error);
  }

  redirect("/app/setup");
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

  redirect("/browse");
}

export async function completeServiceStoreOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  const parsed = serviceStoreOnboardingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    await assertTenantExists(input.tenantId);

    const domainUserId = await resolveDomainUserIdForServiceStoreOnboarding(
      session.user.id,
      {
        tenantId: input.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
      },
    );

    await prisma.$transaction(async (tx) => {
      if (input.mode === "claim") {
        const serviceStore = await tx.serviceStore.findFirst({
          where: {
            id: input.serviceStoreId,
            tenantId: input.tenantId,
          },
          select: { id: true },
        });

        if (!serviceStore) {
          throw new Error("MERCHANT_NOT_FOUND");
        }

        const existingClaim = await tx.serviceStoreClaim.findFirst({
          where: {
            serviceStoreId: input.serviceStoreId,
            userId: domainUserId,
            status: "PENDING",
          },
          select: { id: true },
        });

        if (existingClaim) {
          throw new Error("CLAIM_EXISTS");
        }

        await tx.serviceStoreClaim.create({
          data: {
            serviceStoreId: input.serviceStoreId,
            userId: domainUserId,
          },
        });
      } else {
        const existingServiceStoreCode = await tx.serviceStore.findFirst({
          where: {
            tenantId: input.tenantId,
            code: input.businessCode,
          },
          select: { id: true },
        });

        if (existingServiceStoreCode) {
          throw new Error("BUSINESS_CODE_EXISTS");
        }

        await tx.serviceStoreOnboardingRequest.create({
          data: {
            userId: domainUserId,
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
      if (error.message === "EMAIL_IN_USE") {
        return { error: "This email is already in use." };
      }
      if (error.message === "LINE_USER_IN_USE") {
        return { error: "This LINE account is already linked to another profile." };
      }
    }

    return { error: "Unable to complete serviceStore onboarding. Please try again." };
  }

  redirect("/app");
}

export async function searchServiceStoresAction(tenantId: string, query: string) {
  const session = await getServerSession();
  if (!session) {
    return [];
  }

  if (!tenantId) {
    return [];
  }

  return searchServiceStores(tenantId, query);
}
