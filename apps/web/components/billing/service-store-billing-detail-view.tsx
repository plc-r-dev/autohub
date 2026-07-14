"use client"

import { useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  FileText,
} from "lucide-react"
import { ServiceStorePaymentSlipForm } from "@/components/billing/service-store-payment-slip-form"
import { PromptPayQrCard } from "@/components/billing/promptpay-qr-card"
import {
  ServiceStoreButton,
  ServiceStoreCard,
  ServiceStoreStatusBadge,
} from "@/components/service-store/ui"
import { cn } from "@workspace/ui/lib/utils"

export type StoreBillingDetailItem = {
  id: string
  bookingNumber: string
  bookingDateLabel: string
  customerName: string
  serviceName: string
  feeLabel: string
}

export type StoreBillingDetailPayment = {
  id: string
  paymentDateLabel: string
  amountLabel: string
  referenceNumber?: string
  submittedAtLabel: string
  reviewStatus: string
  reviewStatusLabel: string
  rejectReason?: string
}

export type StoreBillingDetailViewProps = {
  billingId: string
  status: string
  statusLabel: string
  canUpload: boolean
  periodLabel: string
  amountDueLabel: string
  dueDateLabel: string
  daysLeftLabel: string | null
  bookingCount: number
  bookingFeeLabel: string
  vatRateLabel: string
  vatLabel: string
  rejectReason?: string | null
  items: StoreBillingDetailItem[]
  payments: StoreBillingDetailPayment[]
  promptPay?: {
    payload: string | null
    amountLabel: string
    accountName?: string
    bankName?: string
    targetLabel?: string
  }
}

export function ServiceStoreBillingDetailView({
  billingId,
  status,
  statusLabel,
  canUpload,
  periodLabel,
  amountDueLabel,
  dueDateLabel,
  daysLeftLabel,
  bookingCount,
  bookingFeeLabel,
  vatRateLabel,
  vatLabel,
  rejectReason,
  items,
  payments,
  promptPay,
}: StoreBillingDetailViewProps) {
  const [showAllBookings, setShowAllBookings] = useState(false)
  const visibleItems = showAllBookings ? items : items.slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#64748B]">{periodLabel}</p>
          <ServiceStoreStatusBadge label={statusLabel} status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ServiceStoreButton
            type="button"
            variant="secondary"
            className="gap-2"
            disabled
            title="PDF export is not available yet"
          >
            <FileText className="size-4" />
            View billing PDF
          </ServiceStoreButton>
        </div>
      </section>

      {status === "REJECTED" && rejectReason ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Payment rejected</p>
          <p className="mt-1">{rejectReason}</p>
          <p className="mt-2 text-red-600/80">
            Please upload a new payment slip to resubmit.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ServiceStoreCard className="space-y-2 sm:col-span-2 xl:col-span-1">
              <p className="text-sm font-medium text-[#64748B]">Amount Due</p>
              <p className="text-3xl font-bold tracking-tight text-[#16A34A]">
                {amountDueLabel}
              </p>
              <p className="text-sm text-[#64748B]">
                Please upload your payment slip and submit for review.
              </p>
            </ServiceStoreCard>

            <ServiceStoreCard className="space-y-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Billing Summary
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#64748B]">Completed Bookings</dt>
                  <dd className="font-medium text-[#0F172A]">{bookingCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#64748B]">Booking Fee (incl. VAT)</dt>
                  <dd className="font-medium text-[#0F172A]">{bookingFeeLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#64748B]">VAT ({vatRateLabel})</dt>
                  <dd className="font-medium text-[#0F172A]">{vatLabel}</dd>
                </div>
              </dl>
            </ServiceStoreCard>

            <ServiceStoreCard className="flex flex-col justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16A34A]">
                <CalendarDays className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Due Date</p>
                <p className="mt-0.5 text-base font-semibold text-[#0F172A]">
                  {dueDateLabel}
                </p>
                {daysLeftLabel ? (
                  <p className="mt-0.5 text-xs text-[#94A3B8]">{daysLeftLabel}</p>
                ) : null}
              </div>
            </ServiceStoreCard>
          </section>

          <ServiceStoreCard className="space-y-4">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Bookings Included ({bookingCount})
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-[#8a97a5]">No billable bookings.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[42rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eef3f7] text-[#94A3B8]">
                        <th className="pb-3 pr-4 font-medium">Booking ID</th>
                        <th className="pb-3 pr-4 font-medium">Customer</th>
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Service</th>
                        <th className="pb-3 text-right font-medium">
                          Amount (incl. VAT)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#f5f8fb] last:border-0"
                        >
                          <td className="py-3 pr-4 font-semibold text-[#16A34A]">
                            {item.bookingNumber}
                          </td>
                          <td className="py-3 pr-4 text-[#0F172A]">
                            {item.customerName}
                          </td>
                          <td className="py-3 pr-4 text-[#64748B]">
                            {item.bookingDateLabel}
                          </td>
                          <td className="py-3 pr-4 text-[#0F172A]">
                            {item.serviceName}
                          </td>
                          <td className="py-3 text-right font-medium text-[#0F172A]">
                            {item.feeLabel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {items.length > 6 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllBookings((value) => !value)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A] hover:underline"
                  >
                    {showAllBookings
                      ? "Show fewer bookings"
                      : `View all ${items.length} bookings`}
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        showAllBookings && "rotate-180",
                      )}
                    />
                  </button>
                ) : null}
              </div>
            )}
          </ServiceStoreCard>

          <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1e40af]">
            Billing is generated by admin based on completed bookings. If you
            have any questions, please contact support.
          </div>
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
          {promptPay ? (
            <PromptPayQrCard
              payload={promptPay.payload}
              amountLabel={promptPay.amountLabel}
              accountName={promptPay.accountName}
              bankName={promptPay.bankName}
              targetLabel={promptPay.targetLabel}
            />
          ) : null}

          <ServiceStoreCard id="submit-payment" className="scroll-mt-24 space-y-4">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Submit Payment
            </h2>
            <ServiceStorePaymentSlipForm
              billingId={billingId}
              canUpload={canUpload}
            />
          </ServiceStoreCard>

          <ServiceStoreCard className="space-y-3">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Payment History
            </h2>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#94A3B8]">
                  <FileText className="size-5" />
                </div>
                <p className="max-w-[14rem] text-sm text-[#64748B]">
                  No payment submissions yet. Once you submit a payment, it will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border border-[#eef3f7] p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[#0F172A]">
                        {payment.paymentDateLabel} · {payment.amountLabel}
                      </p>
                      <ServiceStoreStatusBadge
                        label={payment.reviewStatusLabel}
                        status={payment.reviewStatus}
                      />
                    </div>
                    {payment.referenceNumber ? (
                      <p className="mt-1 text-[#8a97a5]">
                        Ref: {payment.referenceNumber}
                      </p>
                    ) : null}
                    <p className="text-xs text-[#8a97a5]">
                      Submitted {payment.submittedAtLabel}
                    </p>
                    {payment.rejectReason ? (
                      <p className="mt-2 rounded-lg bg-red-50 p-2 text-red-700">
                        Reject reason: {payment.rejectReason}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </ServiceStoreCard>
        </aside>
      </div>
    </div>
  )
}
