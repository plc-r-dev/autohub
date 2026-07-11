import type { BookingStatus } from "@/lib/generated/prisma/client";

const TERMINAL_STATUSES: BookingStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const ALLOWED_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  if (from === to) {
    return false;
  }

  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) {
    return false;
  }

  return allowed.includes(to);
}

export function assertBookingStatusTransition(
  from: BookingStatus,
  to: BookingStatus,
): { ok: true } | { ok: false; error: string } {
  if (isTerminalBookingStatus(from)) {
    return {
      ok: false,
      error: `Bookings with status ${from} cannot be changed.`,
    };
  }

  if (!canTransitionBookingStatus(from, to)) {
    return {
      ok: false,
      error: `Cannot transition booking from ${from} to ${to}.`,
    };
  }

  return { ok: true };
}

export function getTimelineUpdateForStatus(
  toStatus: BookingStatus,
  now = new Date(),
): {
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  noShowAt?: Date;
} {
  switch (toStatus) {
    case "CONFIRMED":
      return { confirmedAt: now };
    case "IN_PROGRESS":
      return { startedAt: now };
    case "COMPLETED":
      return { completedAt: now };
    case "CANCELLED":
      return { cancelledAt: now };
    case "NO_SHOW":
      return { noShowAt: now };
    default:
      return {};
  }
}

export function getAllowedServiceStoreActions(
  status: BookingStatus,
): BookingStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}
