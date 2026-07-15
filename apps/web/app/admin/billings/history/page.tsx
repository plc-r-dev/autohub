import { Suspense } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminBillingOperations } from "@/components/billing/admin-billing-operations"
import { requireAdminSession } from "@/lib/auth/require-admin"
import {
  formatBillingDate,
  toBillingPeriodKey,
} from "@/lib/billing/format"
import {
  getAdminBillingHistoryBatches,
  getAdminBillingOperationsKpis,
  getAdminBillingOperationRows,
  getBillingGenerationEstimate,
} from "@/lib/billing/queries"
import { getPlatformSettings } from "@/lib/platform-settings/queries"

function getDefaultPreviousMonthPeriod() {
  const now = new Date()
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(firstOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000)
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1)
  return { periodStart, periodEnd }
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default async function AdminBillingHistoryPage() {
  await requireAdminSession()
  const { periodStart, periodEnd } = getDefaultPreviousMonthPeriod()

  const [kpis, platformSettings, estimate, billingRowsRaw, historyBatches] =
    await Promise.all([
      getAdminBillingOperationsKpis(),
      getPlatformSettings(),
      getBillingGenerationEstimate(periodStart, periodEnd),
      getAdminBillingOperationRows(),
      getAdminBillingHistoryBatches(),
    ])

  const paymentRows = billingRowsRaw.map((row) => ({
    id: row.id,
    storeName: row.serviceStore.name,
    storeCode: row.serviceStore.code,
    invoiceNumber: row.invoiceNumber,
    periodLabel: `${formatBillingDate(row.periodStart)} – ${formatBillingDate(row.periodEnd)}`,
    periodKey: toBillingPeriodKey(row.periodStart),
    amount: Number(row.total.toString()),
    submittedAt: row.paymentSubmittedAt?.toISOString() ?? null,
    status: row.status,
    bookingCount: row.bookingCount,
  }))

  return (
    <AdminLayout
      title="Billing History"
      description="Generate billing batches, review payment slips, and track history."
    >
      <Suspense fallback={null}>
        <AdminBillingOperations
          kpis={kpis}
          defaultPeriodStart={toDateInputValue(periodStart)}
          defaultPeriodEnd={toDateInputValue(periodEnd)}
          bookingFee={platformSettings.bookingFee.toString()}
          vatRate={platformSettings.vatRate.toString()}
          currency={platformSettings.currency}
          initialEstimate={estimate}
          paymentRows={paymentRows}
          historyBatches={historyBatches}
          initialTab="history"
        />
      </Suspense>
    </AdminLayout>
  )
}
