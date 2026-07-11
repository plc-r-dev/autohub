"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDefaultOperatingHours } from "@/lib/booking/engine/time";
import { fetchGooglePlaceDetails } from "@/lib/google-places/client";
import { getServerSession } from "@/lib/auth/session";
import { getLineUserId } from "@/lib/onboarding/context";
import {
  serviceStoreClaimSchema,
  serviceStoreCreateSchema,
} from "@/lib/onboarding/schemas";
import {
  canTransitionToReadyForBooking,
  slugifyBusinessCode,
} from "@/lib/service-store/domain";
import {
  getOnboardingSetupProgress,
  loadOnboardingSetupInput,
} from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { prisma } from "@/lib/prisma";

export type SetupActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

function revalidateSetupPaths() {
  revalidatePath("/service-store/setup");
  revalidatePath("/service-store/dashboard");
  revalidatePath("/service-store/readiness");
  revalidatePath("/browse");
}

async function assertUniqueBusinessCode(
  tenantId: string,
  code: string,
  excludeServiceStoreId?: string,
) {
  const existing = await prisma.serviceStore.findFirst({
    where: {
      tenantId,
      code,
      ...(excludeServiceStoreId ? { NOT: { id: excludeServiceStoreId } } : {}),
    },
    select: { id: true },
  });
  return !existing;
}

async function generateUniqueBusinessCode(tenantId: string, name: string) {
  const base = slugifyBusinessCode(name) || "service-store";
  let candidate = base;
  let suffix = 2;
  while (!(await assertUniqueBusinessCode(tenantId, candidate))) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function saveVerifyBusinessStep(
  _prev: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  const ctx = await requireServiceStoreContext();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const businessCategory = String(formData.get("businessCategory") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  const fieldErrors: Record<string, string[]> = {};
  if (!name) fieldErrors.name = ["Name is required"];
  if (!phone) fieldErrors.phone = ["Phone is required"];
  if (!businessCategory) fieldErrors.businessCategory = ["Category is required"];
  if (!address) fieldErrors.address = ["Address is required"];
  if (Number.isNaN(latitude)) fieldErrors.latitude = ["Location is required"];
  if (Number.isNaN(longitude)) fieldErrors.longitude = ["Location is required"];
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const branch = await prisma.branch.findFirst({
    where: { serviceStoreId: ctx.serviceStore.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.serviceStore.update({
      where: { id: ctx.serviceStore.id },
      data: {
        name,
        phone,
        email: email || null,
        businessCategory,
        description: description || null,
        website: website || null,
      },
    });

    if (branch) {
      await tx.branch.update({
        where: { id: branch.id },
        data: {
          name,
          phone,
          address,
          latitude,
          longitude,
        },
      });
    } else {
      const created = await tx.branch.create({
        data: {
          serviceStoreId: ctx.serviceStore.id,
          code: "main",
          name,
          phone,
          address,
          latitude,
          longitude,
        },
      });
      await tx.branchOperatingHours.createMany({
        data: getDefaultOperatingHours().map((hours) => ({
          branchId: created.id,
          ...hours,
        })),
      });
    }
  });

  revalidateSetupPaths();
  redirect("/service-store/setup/services");
}

export async function savePaymentAccountStep(
  _prev: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  const ctx = await requireServiceStoreContext();
  const payoutBankName = String(formData.get("payoutBankName") ?? "").trim();
  const payoutAccountName = String(formData.get("payoutAccountName") ?? "").trim();
  const payoutAccountNumber = String(formData.get("payoutAccountNumber") ?? "").trim();
  const payoutBankBranch = String(formData.get("payoutBankBranch") ?? "").trim();

  const fieldErrors: Record<string, string[]> = {};
  if (!payoutBankName) fieldErrors.payoutBankName = ["Bank name is required"];
  if (!payoutAccountName) fieldErrors.payoutAccountName = ["Account name is required"];
  if (!payoutAccountNumber) fieldErrors.payoutAccountNumber = ["Account number is required"];
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  await prisma.serviceStore.update({
    where: { id: ctx.serviceStore.id },
    data: {
      payoutBankName,
      payoutAccountName,
      payoutAccountNumber,
      payoutBankBranch: payoutBankBranch || null,
    },
  });

  revalidateSetupPaths();
  redirect("/service-store/setup/team");
}

export async function completeOnboardingSetup() {
  const ctx = await requireServiceStoreContext();
  const input = await loadOnboardingSetupInput(ctx.serviceStore.id);
  if (!input || !canTransitionToReadyForBooking(input)) {
    redirect("/service-store/setup");
  }

  await prisma.serviceStore.update({
    where: { id: ctx.serviceStore.id },
    data: {
      status: "READY_FOR_BOOKING",
      bookingEnabled: true,
    },
  });

  revalidateSetupPaths();
  redirect("/service-store/dashboard");
}

export async function skipTeamSetupStep() {
  await requireServiceStoreContext();
  redirect("/service-store/setup/payment");
}

export async function fetchClaimPrefillAction(serviceStoreId: string, googlePlaceId?: string) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      website: true,
      description: true,
      businessCategory: true,
      googlePlaceId: true,
      branches: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: {
          address: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  if (!store) {
    return null;
  }

  const placeId = googlePlaceId || store.googlePlaceId || undefined;
  const place = placeId ? await fetchGooglePlaceDetails(placeId) : null;
  const branch = store.branches[0];

  return {
    serviceStoreId: store.id,
    googlePlaceId: place?.placeId ?? placeId ?? null,
    businessCategory: store.businessCategory ?? inferCategoryFromPlaceTypes(place?.types ?? []),
    proposedName: place?.name ?? store.name,
    proposedPhone: place?.phone ?? store.phone ?? "",
    proposedEmail: store.email ?? "",
    proposedWebsite: place?.website ?? store.website ?? "",
    proposedDescription: place?.description ?? store.description ?? "",
    proposedAddress: place?.formattedAddress ?? branch?.address ?? "",
    proposedLatitude: place?.latitude ?? (branch?.latitude ? Number(branch.latitude) : null),
    proposedLongitude: place?.longitude ?? (branch?.longitude ? Number(branch.longitude) : null),
  };
}

function inferCategoryFromPlaceTypes(types: string[]): string | null {
  if (types.some((type) => type.includes("car_wash"))) return "car-wash";
  if (types.some((type) => type.includes("car_repair"))) return "general-repair";
  return null;
}
