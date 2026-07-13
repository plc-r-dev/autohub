export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatBookingDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatBookingTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatBookingTime24(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatRelativeTime(value: Date | string) {
  const target = new Date(value).getTime();
  const diffMs = Date.now() - target;
  const minutes = Math.round(diffMs / (60 * 1000));

  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatPrice(value: { toString(): string } | number) {
  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

import type { BookingStatus } from "@/lib/generated/prisma/client";

export const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING" as const, label: "Pending" },
  { value: "CONFIRMED" as const, label: "Confirmed" },
  { value: "IN_PROGRESS" as const, label: "In Service" },
  { value: "COMPLETED" as const, label: "Completed" },
  { value: "CANCELLED" as const, label: "Cancelled" },
] satisfies ReadonlyArray<{ value: BookingStatus; label: string }>;

export function bookingStatusLabel(status: string) {
  const match = BOOKING_STATUS_OPTIONS.find((option) => option.value === status);
  if (match) {
    return match.label;
  }

  switch (status) {
    case "CHECKED_IN":
      return "Checked in";
    case "NO_SHOW":
      return "No show";
    default:
      return status.replaceAll("_", " ");
  }
}

export function formatTimelineLabel(key: string) {
  switch (key) {
    case "confirmedAt":
      return "Confirmed";
    case "startedAt":
      return "Started";
    case "completedAt":
      return "Completed";
    case "cancelledAt":
      return "Cancelled";
    case "noShowAt":
      return "No-show";
    default:
      return key;
  }
}
