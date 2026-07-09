import { prisma } from "@/lib/prisma";

export const PLATFORM_SETTINGS_ID = "default";

export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: { id: PLATFORM_SETTINGS_ID },
    update: {},
  });
}

export type PlatformSettingsSnapshot = {
  bookingFee: number;
  vatRate: number;
  currency: string;
  billingDueDays: number;
};

export async function getBillingSettingsSnapshot(): Promise<PlatformSettingsSnapshot> {
  const settings = await getPlatformSettings();
  return {
    bookingFee: Number(settings.bookingFee),
    vatRate: Number(settings.vatRate),
    currency: settings.currency,
    billingDueDays: settings.billingDueDays,
  };
}
