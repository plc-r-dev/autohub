"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
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
import { slugifyBusinessCode } from "@/lib/service-store/domain"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"
import {
  deleteStoredFile,
  uploadClaimDocumentFile,
  uploadOnboardingRequestDocumentFile,
} from "@/lib/storage/upload-service"
import { UploadValidationError } from "@/lib/storage/validation"

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      result[key] = value
    }
  }
  return result
}

function parseGoogleMapsCoordinates(
  url: string,
): { latitude: number; longitude: number } | null {
  const atMatch = url.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
  if (atMatch) {
    return {
      latitude: Number(atMatch[1]),
      longitude: Number(atMatch[2]),
    }
  }

  const queryMatch = url.match(/[?&](?:q|ll|query)=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
  if (queryMatch) {
    return {
      latitude: Number(queryMatch[1]),
      longitude: Number(queryMatch[2]),
    }
  }

  const bangMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (bangMatch) {
    return {
      latitude: Number(bangMatch[1]),
      longitude: Number(bangMatch[2]),
    }
  }

  return null
}

function requireUploadFiles(formData: FormData):
  | { ok: true; citizenIdFile: File; companyDocumentFile: File }
  | { ok: false; state: OnboardingActionState } {
  const citizenIdFile = formData.get("citizenIdFile")
  const companyDocumentFile = formData.get("companyDocumentFile")

  if (!(citizenIdFile instanceof File) || citizenIdFile.size === 0) {
    return {
      ok: false,
      state: {
        fieldErrors: {
          citizenIdFile: ["Citizen ID document is required."],
        },
      },
    }
  }

  if (!(companyDocumentFile instanceof File) || companyDocumentFile.size === 0) {
    return {
      ok: false,
      state: {
        fieldErrors: {
          companyDocumentFile: ["Store Document is required."],
        },
      },
    }
  }

  return { ok: true, citizenIdFile, companyDocumentFile }
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
  if (error instanceof UploadValidationError) {
    return { error: error.message }
  }
  if (error instanceof Error) {
    if (error.message === "MERCHANT_NOT_FOUND") {
      return { error: "The selected business could not be found." }
    }
    if (error.message === "CLAIM_EXISTS") {
      return {
        error:
          "This LINE account has already claimed this business and cannot claim it again.",
      }
    }
    if (error.message === "ALREADY_MEMBER") {
      return {
        error: "You are already a member of this service store.",
      }
    }
    if (error.message === "NAME_PENDING_CLAIM") {
      return {
        error:
          "This store name matches a pending claim or create request. Please use a different name.",
        fieldErrors: {
          businessName: [
            "This name is already used on a pending request.",
          ],
        },
      }
    }
    if (error.message === "PENDING_CREATE_EXISTS") {
      return {
        error:
          "You already have a pending create-store request awaiting admin approval.",
      }
    }
    if (error.message === "BUSINESS_CODE_EXISTS") {
      return {
        error: "This business code is already taken in the selected tenant.",
      }
    }
    if (error.message === "EMAIL_IN_USE") {
      return { error: "This email is already in use." }
    }
    if (error.message === "LINE_USER_IN_USE") {
      return {
        error: "This LINE account is already linked to another profile.",
      }
    }
    if (error.message === "CITIZEN_ID_REQUIRED") {
      return {
        fieldErrors: {
          citizenIdFile: ["Citizen ID document is required."],
        },
      }
    }
    if (error.message === "COMPANY_DOCUMENT_REQUIRED") {
      return {
        fieldErrors: {
          companyDocumentFile: ["Store Document is required."],
        },
      }
    }
  }
  return { error: "Unable to complete onboarding. Please try again." }
}

/** Same LINE user cannot claim the same store again (any prior claim) or if already a member. */
async function assertCanClaimServiceStore(
  tx: Prisma.TransactionClient,
  userId: string,
  serviceStoreId: string,
) {
  const existingClaim = await tx.serviceStoreClaim.findFirst({
    where: {
      serviceStoreId,
      userId,
    },
    select: { id: true },
  })
  if (existingClaim) {
    throw new Error("CLAIM_EXISTS")
  }

  const membership = await tx.serviceStoreMember.findUnique({
    where: {
      serviceStoreId_userId: {
        serviceStoreId,
        userId,
      },
    },
    select: { id: true },
  })
  if (membership) {
    throw new Error("ALREADY_MEMBER")
  }
}

/** Create name must not collide with pending claims or pending create requests. */
async function assertCreateNameNotPendingClaim(
  tx: Prisma.TransactionClient,
  tenantId: string,
  businessName: string,
) {
  const name = businessName.trim()
  if (!name) return

  const [byProposedName, byStoreName, byPendingRequest] = await Promise.all([
    tx.serviceStoreClaim.findFirst({
      where: {
        status: "PENDING",
        proposedName: { equals: name, mode: "insensitive" },
        serviceStore: { tenantId },
      },
      select: { id: true },
    }),
    tx.serviceStoreClaim.findFirst({
      where: {
        status: "PENDING",
        serviceStore: {
          tenantId,
          name: { equals: name, mode: "insensitive" },
        },
      },
      select: { id: true },
    }),
    tx.serviceStoreOnboardingRequest.findFirst({
      where: {
        status: "PENDING",
        tenantId,
        businessName: { equals: name, mode: "insensitive" },
      },
      select: { id: true },
    }),
  ])

  if (byProposedName || byStoreName || byPendingRequest) {
    throw new Error("NAME_PENDING_CLAIM")
  }
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

  const files = requireUploadFiles(formData)
  if (!files.ok) {
    return files.state
  }

  const claimId = randomUUID()
  let citizenUpload: Awaited<ReturnType<typeof uploadClaimDocumentFile>> | null =
    null
  let companyUpload: Awaited<ReturnType<typeof uploadClaimDocumentFile>> | null =
    null

  try {
    await assertTenantExists(input.tenantId);

    citizenUpload = await uploadClaimDocumentFile({
      claimId,
      kind: "citizen-id",
      file: files.citizenIdFile,
    })
    companyUpload = await uploadClaimDocumentFile({
      claimId,
      kind: "company-document",
      file: files.companyDocumentFile,
    })

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
        throw new Error("MERCHANT_NOT_FOUND")
      }

      await assertCanClaimServiceStore(tx, domainUserId, input.serviceStoreId)

      await tx.serviceStoreClaim.create({
        data: {
          id: claimId,
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
          citizenIdKey: citizenUpload!.key,
          citizenIdUrl: citizenUpload!.url,
          citizenIdFileName: citizenUpload!.fileName,
          citizenIdFileSize: citizenUpload!.fileSize,
          citizenIdMimeType: citizenUpload!.mimeType,
          companyDocumentKey: companyUpload!.key,
          companyDocumentUrl: companyUpload!.url,
          companyDocumentFileName: companyUpload!.fileName,
          companyDocumentFileSize: companyUpload!.fileSize,
          companyDocumentMimeType: companyUpload!.mimeType,
        },
      })
    })
  } catch (error) {
    if (citizenUpload?.key) {
      await deleteStoredFile(citizenUpload.key).catch(() => undefined)
    }
    if (companyUpload?.key) {
      await deleteStoredFile(companyUpload.key).catch(() => undefined)
    }
    return mapOnboardingError(error)
  }

  redirect("/app")
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

  const files = requireUploadFiles(formData)
  if (!files.ok) {
    return files.state
  }

  const requestId = randomUUID()
  let citizenUpload: Awaited<
    ReturnType<typeof uploadOnboardingRequestDocumentFile>
  > | null = null
  let companyUpload: Awaited<
    ReturnType<typeof uploadOnboardingRequestDocumentFile>
  > | null = null

  try {
    await assertTenantExists(input.tenantId);

    citizenUpload = await uploadOnboardingRequestDocumentFile({
      requestId,
      kind: "citizen-id",
      file: files.citizenIdFile,
    })
    companyUpload = await uploadOnboardingRequestDocumentFile({
      requestId,
      kind: "company-document",
      file: files.companyDocumentFile,
    })

    const domainUserId = await resolveDomainUserIdForServiceStoreOnboarding(
      session.user.id,
      {
        tenantId: input.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    );

    const businessCode = await generateUniqueBusinessCode(
      input.tenantId,
      input.businessName,
    );
    const coordinates = parseGoogleMapsCoordinates(input.googleMapsUrl);

    await prisma.$transaction(async (tx) => {
      await assertCreateNameNotPendingClaim(
        tx,
        input.tenantId,
        input.businessName,
      )

      const existingPending = await tx.serviceStoreOnboardingRequest.findFirst({
        where: {
          userId: domainUserId,
          status: "PENDING",
        },
        select: { id: true },
      })
      if (existingPending) {
        throw new Error("PENDING_CREATE_EXISTS")
      }

      await tx.serviceStoreOnboardingRequest.create({
        data: {
          id: requestId,
          userId: domainUserId,
          tenantId: input.tenantId,
          businessName: input.businessName,
          businessCode,
          description: input.description,
          phone: input.phone,
          website: input.googleMapsUrl,
          address: input.address,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          citizenIdKey: citizenUpload!.key,
          citizenIdUrl: citizenUpload!.url,
          citizenIdFileName: citizenUpload!.fileName,
          citizenIdFileSize: citizenUpload!.fileSize,
          citizenIdMimeType: citizenUpload!.mimeType,
          companyDocumentKey: companyUpload!.key,
          companyDocumentUrl: companyUpload!.url,
          companyDocumentFileName: companyUpload!.fileName,
          companyDocumentFileSize: companyUpload!.fileSize,
          companyDocumentMimeType: companyUpload!.mimeType,
        },
      })
    });
  } catch (error) {
    if (citizenUpload?.key) {
      await deleteStoredFile(citizenUpload.key).catch(() => undefined)
    }
    if (companyUpload?.key) {
      await deleteStoredFile(companyUpload.key).catch(() => undefined)
    }
    return mapOnboardingError(error);
  }

  redirect("/app");
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
          throw new Error("MERCHANT_NOT_FOUND")
        }

        await assertCanClaimServiceStore(tx, domainUserId, input.serviceStoreId)

        await tx.serviceStoreClaim.create({
          data: {
            serviceStoreId: input.serviceStoreId,
            userId: domainUserId,
          },
        })
      } else {
        await assertCreateNameNotPendingClaim(
          tx,
          input.tenantId,
          input.businessName,
        )

        const existingServiceStoreCode = await tx.serviceStore.findFirst({
          where: {
            tenantId: input.tenantId,
            code: input.businessCode,
          },
          select: { id: true },
        })

        if (existingServiceStoreCode) {
          throw new Error("BUSINESS_CODE_EXISTS")
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
            citizenIdKey: "legacy/missing-citizen-id",
            citizenIdUrl: "",
            citizenIdFileName: "missing",
            citizenIdFileSize: 0,
            citizenIdMimeType: "application/octet-stream",
            companyDocumentKey: "legacy/missing-store-document",
            companyDocumentUrl: "",
            companyDocumentFileName: "missing",
            companyDocumentFileSize: 0,
            companyDocumentMimeType: "application/octet-stream",
          },
        })
      }
    })
  } catch (error) {
    return mapOnboardingError(error)
  }

  redirect("/app")
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
