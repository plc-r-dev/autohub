import type { BookingStatus } from "@/lib/generated/prisma/client";

export const BLOCKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
];

export type BookingOccupancyWindow = {
  startMs: number;
  endMs: number;
};

export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

export function getOccupiedEndTime(
  bookingStart: Date,
  durationMinutes: number,
  bufferMinutes: number,
): Date {
  return new Date(
    bookingStart.getTime() + (durationMinutes + bufferMinutes) * 60 * 1000,
  );
}

export function getBookingOccupiedMinutes(
  items: Array<{
    service: { duration: number; bufferMinutes: number };
  }>,
): number {
  return items.reduce(
    (total, item) =>
      total + item.service.duration + item.service.bufferMinutes,
    0,
  );
}

export function getBookingOccupancyWindow(
  bookingStart: Date,
  items: Array<{
    service: { duration: number; bufferMinutes: number };
  }>,
): BookingOccupancyWindow {
  const occupiedMinutes = getBookingOccupiedMinutes(items);
  const startMs = bookingStart.getTime();
  const endMs = startMs + occupiedMinutes * 60 * 1000;

  return { startMs, endMs };
}

export function countOverlappingBookings(
  bookingStart: Date,
  durationMinutes: number,
  bufferMinutes: number,
  existingBookings: Array<{
    bookingDate: Date;
    items: Array<{
      service: { duration: number; bufferMinutes: number };
    }>;
  }>,
): number {
  const newStart = bookingStart.getTime();
  const newEnd = getOccupiedEndTime(
    bookingStart,
    durationMinutes,
    bufferMinutes,
  ).getTime();

  return existingBookings.reduce((count, booking) => {
    const window = getBookingOccupancyWindow(booking.bookingDate, booking.items);

    return intervalsOverlap(newStart, newEnd, window.startMs, window.endMs)
      ? count + 1
      : count;
  }, 0);
}

export function isSlotCapacityAvailable(
  overlapCount: number,
  concurrentCapacity: number,
): boolean {
  return overlapCount < concurrentCapacity;
}
