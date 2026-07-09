import { AdminLayout } from "@/components/admin/admin-layout";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { getPlatformSettings } from "@/lib/platform-settings/queries";

export default async function AdminPlatformSettingsPage() {
  await requireLinkedIdentity();
  const settings = await getPlatformSettings();

  return (
    <AdminLayout
      title="Platform settings"
      description="Configure billing, company, bank account, storage, and system defaults."
    >
      <PlatformSettingsForm
        defaultValues={{
          bookingFee: settings.bookingFee.toString(),
          vatRate: settings.vatRate.toString(),
          currency: settings.currency,
          billingDueDays: settings.billingDueDays,
          companyName: settings.companyName,
          taxId: settings.taxId,
          address: settings.address,
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          bankBranch: settings.bankBranch,
          storageProvider: settings.storageProvider,
          bucketName: settings.bucketName,
          storageRegion: settings.storageRegion,
          timeZone: settings.timeZone,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
        }}
      />
    </AdminLayout>
  );
}
