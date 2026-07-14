import type { BillingStatus } from "@/lib/generated/prisma/client"

/** Canonical billing lifecycle for payment submission and review. */
export const BILLING_STATUSES = [
  "PENDING",
  "PAYMENT_SUBMITTED",
  "PAID",
  "REJECTED",
  "CANCELLED",
] as const satisfies readonly BillingStatus[]

export type AppBillingStatus = (typeof BILLING_STATUSES)[number]

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  PENDING: "Pending Payment",
  PAYMENT_SUBMITTED: "Payment Submitted",
  PAID: "Paid",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

export function canSubmitBillingPayment(status: BillingStatus): boolean {
  return status === "PENDING" || status === "REJECTED"
}

export function canReviewBillingPayment(status: BillingStatus): boolean {
  return status === "PAYMENT_SUBMITTED"
}
