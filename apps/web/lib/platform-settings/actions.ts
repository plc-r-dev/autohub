"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { PLATFORM_SETTINGS_ID } from "@/lib/platform-settings/queries";
import { platformSettingsSchema } from "@/lib/platform-settings/schemas";
import { prisma } from "@/lib/prisma";

export type PlatformSettingsActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function updatePlatformSettings(
  _prev: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  try {
    await requireLinkedIdentity();
  } catch {
    return { error: "Unauthorized." };
  }

  const parsed = platformSettingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: {
      id: PLATFORM_SETTINGS_ID,
      bookingFee: new Prisma.Decimal(data.bookingFee),
      vatRate: new Prisma.Decimal(data.vatRate),
      currency: data.currency,
      billingDueDays: data.billingDueDays,
      companyName: data.companyName,
      taxId: data.taxId,
      address: data.address,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bankBranch: data.bankBranch,
      storageProvider: data.storageProvider,
      bucketName: data.bucketName,
      storageRegion: data.storageRegion,
      timeZone: data.timeZone,
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
    },
    update: {
      bookingFee: new Prisma.Decimal(data.bookingFee),
      vatRate: new Prisma.Decimal(data.vatRate),
      currency: data.currency,
      billingDueDays: data.billingDueDays,
      companyName: data.companyName,
      taxId: data.taxId,
      address: data.address,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bankBranch: data.bankBranch,
      storageProvider: data.storageProvider,
      bucketName: data.bucketName,
      storageRegion: data.storageRegion,
      timeZone: data.timeZone,
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/billings");

  return { success: "Platform settings saved." };
}
