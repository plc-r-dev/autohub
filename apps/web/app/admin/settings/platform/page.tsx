import { AdminLayout } from "@/components/admin/admin-layout"
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getPlatformMediaPreviewUrls } from "@/lib/platform-settings/actions"
import { getPlatformSettings } from "@/lib/platform-settings/queries"

type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

function parseTab(
  value?: string,
): "billing" | "company" | "payment" | "storage" | "system" {
  if (
    value === "billing" ||
    value === "company" ||
    value === "payment" ||
    value === "storage" ||
    value === "system"
  ) {
    return value
  }
  return "billing"
}

export default async function AdminPlatformSettingsPage({
  searchParams,
}: PageProps) {
  await requireAdminSession()
  const params = await searchParams
  const settings = await getPlatformSettings()
  const previews = await getPlatformMediaPreviewUrls({
    companyLogoKey: settings.companyLogoKey,
    promptPayQrKey: settings.promptPayQrKey,
  })

  return (
    <AdminLayout
      title="Platform settings"
      description="Configure billing, company, payment, storage, and system defaults."
    >
      <PlatformSettingsForm
        initialTab={parseTab(params.tab)}
        companyLogoUrl={previews.companyLogoUrl}
        promptPayQrUrl={previews.promptPayQrUrl}
        defaultValues={{
          bookingFee: settings.bookingFee.toString(),
          vatRate: settings.vatRate.toString(),
          currency: settings.currency,
          billingDueDays: settings.billingDueDays,
          companyName: settings.companyName,
          taxId: settings.taxId,
          address: settings.address,
          companyLogoKey: settings.companyLogoKey,
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          bankBranch: settings.bankBranch,
          promptPayQrKey: settings.promptPayQrKey,
          storageProvider: settings.storageProvider,
          bucketName: settings.bucketName,
          storageRegion: settings.storageRegion,
          timeZone: settings.timeZone,
          language: settings.language,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          updatedAt: settings.updatedAt.toISOString(),
        }}
      />
    </AdminLayout>
  )
}
