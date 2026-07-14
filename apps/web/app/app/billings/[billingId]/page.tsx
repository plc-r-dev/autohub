import { notFound } from "next/navigation"
import { ServiceStoreBillingDetailView } from "@/components/billing/service-store-billing-detail-view"
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell"
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { canSubmitBillingPayment } from "@/lib/billing/domain"
import {
  billingPaymentReviewStatusLabel,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
} from "@/lib/billing/format"
import { billingStatusLabel, getServiceStoreBilling } from "@/lib/billing/queries"
import {
  buildPromptPayPayload,
  resolvePromptPayTarget,
} from "@/lib/billing/promptpay"
import { getPlatformSettings } from "@/lib/platform-settings/queries"

type PageProps = {
  params: Promise<{ billingId: string }>
}

function differenceInCalendarDays(from: Date, to: Date): number {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end - start) / (24 * 60 * 60 * 1000))
}

export default async function ServiceStoreBillingDetailPage({ params }: PageProps) {
  const { billingId } = await params
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const [billing, platformSettings] = await Promise.all([
    getServiceStoreBilling(billingId, serviceStore.id),
    getPlatformSettings(),
  ])

  if (!billing) {
    notFound()
  }

  const dueDate = new Date(billing.periodEnd)
  dueDate.setDate(dueDate.getDate() + platformSettings.billingDueDays)

  const today = new Date()
  const daysLeft = differenceInCalendarDays(today, dueDate)
  const daysLeftLabel =
    daysLeft > 0
      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
      : daysLeft === 0
        ? "Due today"
        : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`

  // UI: fee is VAT-inclusive. Amount Due = Booking Fee; VAT is informational only.
  const amountDue =
    Number(billing.bookingFee.toString()) * billing.bookingCount
  const vatRate = Number(billing.vatRate.toString())
  const vatIncluded = amountDue * (vatRate / 100)

  const promptPayTarget = resolvePromptPayTarget({
    taxId: platformSettings.taxId,
    accountNumber: platformSettings.accountNumber,
  })
  const promptPayPayload = promptPayTarget
    ? buildPromptPayPayload(promptPayTarget, amountDue)
    : null

  const maskPromptPayId = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "")
    if (digits.length <= 4) return digits
    return `${digits.slice(0, 3)}••••${digits.slice(-4)}`
  }

  return (
    <PageShell
      title="Billing detail"
      nav={serviceStoreNav}
      backHref="/app/billings"
      backLabel="Billing"
    >
      <ServiceStoreBillingDetailView
        billingId={billing.id}
        status={billing.status}
        statusLabel={billingStatusLabel(billing.status)}
        canUpload={canSubmitBillingPayment(billing.status)}
        periodLabel={`${formatBillingDate(billing.periodStart)} – ${formatBillingDate(billing.periodEnd)}`}
        amountDueLabel={formatBillingCurrency(amountDue)}
        dueDateLabel={formatBillingDate(dueDate)}
        daysLeftLabel={daysLeftLabel}
        bookingCount={billing.bookingCount}
        bookingFeeLabel={formatBillingCurrency(amountDue)}
        vatRateLabel={`${billing.vatRate.toString()}%`}
        vatLabel={formatBillingCurrency(vatIncluded)}
        rejectReason={billing.rejectReason}
        promptPay={{
          payload: promptPayPayload,
          amountLabel: formatBillingCurrency(amountDue),
          accountName: platformSettings.accountName.trim() || undefined,
          bankName: platformSettings.bankName.trim() || undefined,
          targetLabel: promptPayTarget
            ? maskPromptPayId(promptPayTarget)
            : undefined,
        }}
        items={billing.items.map((item) => {
          const customer = item.booking.customer
          const fullName = [customer.firstName, customer.lastName]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(" ")
          return {
            id: item.id,
            bookingNumber: item.bookingNumber,
            bookingDateLabel: formatBillingDateTime(item.bookingDate),
            customerName:
              fullName || customer.lineDisplayName?.trim() || "Walk-in customer",
            serviceName:
              item.booking.items
                .map((bookingItem) => bookingItem.service.name)
                .filter(Boolean)
                .join(", ") || "Service",
            feeLabel: formatBillingCurrency(item.fee),
          }
        })}
        payments={billing.payments.map((payment) => ({
          id: payment.id,
          paymentDateLabel: formatBillingDate(payment.paymentDate),
          amountLabel: formatBillingCurrency(payment.amount),
          referenceNumber: payment.referenceNumber ?? undefined,
          submittedAtLabel: formatBillingDateTime(payment.submittedAt),
          reviewStatus: payment.reviewStatus,
          reviewStatusLabel: billingPaymentReviewStatusLabel(payment.reviewStatus),
          rejectReason: payment.rejectReason ?? undefined,
        }))}
      />
    </PageShell>
  )
}
