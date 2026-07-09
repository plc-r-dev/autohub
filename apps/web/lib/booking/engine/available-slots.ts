import { prisma } from "@/lib/prisma";
import {
  BLOCKING_STATUSES,
  countOverlappingBookings,
  isSlotCapacityAvailable,
} from "@/lib/booking/engine/occupancy";
import {
  combineDateAndTime,
  formatMinutesToTime,
  getDayBounds,
  getDefaultOperatingHours,
  parseTimeToMinutes,
} from "@/lib/booking/engine/time";
import { resolveBookingCatalog } from "@/lib/booking/engine/validate-create";

export type AvailableSlot = {
  startTime: string;
  label: string;
};

export async function getAvailableSlots(
  branchId: string,
  serviceId: string,
  date: string,
): Promise<AvailableSlot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [];
  }

  const catalog = await resolveBookingCatalog(branchId, serviceId);
  if (!catalog.ok) {
    return [];
  }

  const { context } = catalog;
  const dayOfWeek = combineDateAndTime(date, "12:00").getDay();

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      slotIntervalMinutes: true,
      concurrentCapacity: true,
      operatingHours: {
        where: { dayOfWeek },
        select: {
          openTime: true,
          closeTime: true,
          isClosed: true,
        },
      },
    },
  });

  if (!branch) {
    return [];
  }

  const hours =
    branch.operatingHours[0] ??
    getDefaultOperatingHours().find((entry) => entry.dayOfWeek === dayOfWeek);
  if (!hours || hours.isClosed) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(hours.openTime);
  const closeMinutes = parseTimeToMinutes(hours.closeTime);
  const occupiedMinutes = context.serviceDuration + context.serviceBufferMinutes;

  if (closeMinutes - openMinutes < occupiedMinutes) {
    return [];
  }

  const { start: dayStart, end: dayEnd } = getDayBounds(date);
  const existingBookings = await prisma.booking.findMany({
    where: {
      branchId,
      status: { in: BLOCKING_STATUSES },
      bookingDate: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      bookingDate: true,
      items: {
        select: {
          service: {
            select: {
              duration: true,
              bufferMinutes: true,
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const slots: AvailableSlot[] = [];

  for (
    let startMinutes = openMinutes;
    startMinutes + occupiedMinutes <= closeMinutes;
    startMinutes += branch.slotIntervalMinutes
  ) {
    const startTimeLabel = formatMinutesToTime(startMinutes);
    const slotStart = combineDateAndTime(date, startTimeLabel);

    if (slotStart <= now) {
      continue;
    }

    const overlapCount = countOverlappingBookings(
      slotStart,
      context.serviceDuration,
      context.serviceBufferMinutes,
      existingBookings,
    );

    if (
      !isSlotCapacityAvailable(overlapCount, branch.concurrentCapacity)
    ) {
      continue;
    }

    slots.push({
      startTime: slotStart.toISOString(),
      label: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(slotStart),
    });
  }

  return slots;
}
