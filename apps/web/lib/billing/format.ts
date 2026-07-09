import type { BillingStatus, BillingPaymentReviewStatus } from "@/lib/generated/prisma/client";

export function formatBillingDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
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
    minimumFractionDigits: 0,
  }).format(amount);
}

export function billingStatusLabel(status: BillingStatus): string {
  return status.replaceAll("_", " ");
}

export function billingPaymentReviewStatusLabel(
  status: BillingPaymentReviewStatus,
): string {
  return status.replaceAll("_", " ");
}
