import type { BillingPaymentReviewStatus, BillingStatus } from "@/lib/generated/prisma/client";
import { BILLING_STATUS_LABELS } from "@/lib/billing/domain";

export function formatBillingDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

/** Billing period display as mm/yyyy (e.g. 07/2026). */
export function formatBillingPeriod(value: Date | string): string {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${month}/${year}`;
}

/** Query param value for a period month: yyyy-mm. */
export function toBillingPeriodKey(value: Date | string): string {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}`;
}

export function parseBillingPeriodKey(period?: string): {
  gte: Date;
  lt: Date;
} | null {
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return null;
  }
  const [year, month] = period.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return null;
  }
  return {
    gte: new Date(year, month - 1, 1),
    lt: new Date(year, month, 1),
  };
}

export function formatBillingDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatBillingCurrency(value: { toString(): string } | number): string {
  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function billingStatusLabel(status: BillingStatus): string {
  return BILLING_STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function billingPaymentReviewStatusLabel(
  status: BillingPaymentReviewStatus,
): string {
  if (status === "PENDING") return "Pending review";
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return String(status).replaceAll("_", " ");
}
