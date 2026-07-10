import type { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";
import { getDayBounds } from "@/lib/booking/engine/time";
import {
  BLOCKING_STATUSES,
  countOverlappingBookings,
  isSlotCapacityAvailable,
} from "@/lib/booking/engine/occupancy";
import { getAvailableSlots } from "@/lib/booking/engine/available-slots";
import { getMerchantBookingFactsByBranchId } from "@/lib/booking/discovery-queries";
import { isMerchantBookable } from "@/lib/marketplace/booking-availability";

export type BookingCreateInput = {
  branchId: string;
  serviceId: string;
  bookingDate: Date;
  allowWalkIn?: boolean;
};

export type BookingCreateContext = {
  tenantId: string;
  merchantId: string;
  merchantName: string;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: Decimal;
  serviceDuration: number;
  serviceBufferMinutes: number;
  concurrentCapacity: number;
};

export type BookingValidationResult =
  | { ok: true; context: BookingCreateContext }
  | { ok: false; errors: string[] };

const MERCHANT_NOT_JOINED_MESSAGE =
  "This service shop has not joined AutoHub yet.";

async function loadBookingCatalog(
  branchId: string,
  serviceId: string,
  options?: { requireMarketplaceBookable?: boolean },
) {
  const errors: string[] = [];
  const requireMarketplaceBookable = options?.requireMarketplaceBookable ?? true;

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      id: true,
      name: true,
      concurrentCapacity: true,
      merchant: {
        select: {
          id: true,
          name: true,
          tenantId: true,
          status: true,
        },
      },
      services: {
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          bufferMinutes: true,
          isActive: true,
        },
      },
    },
  });

  if (!branch) {
    errors.push("Branch does not exist.");
    return { errors, context: null };
  }

  if (requireMarketplaceBookable) {
    const marketplaceFacts = await getMerchantBookingFactsByBranchId(branchId);
    if (!marketplaceFacts || !isMerchantBookable(marketplaceFacts)) {
      errors.push(MERCHANT_NOT_JOINED_MESSAGE);
    }
  }

  if (branch.merchant.status !== "ACTIVE") {
    errors.push("Service shop is not active.");
  }

  const service = branch.services[0];
  if (!service) {
    errors.push("Service does not exist for this branch.");
  } else if (!service.isActive) {
    errors.push("Service is not active.");
  }

  if (errors.length > 0 || !service) {
    return { errors, context: null };
  }

  return {
    errors,
    context: {
      tenantId: branch.merchant.tenantId,
      merchantId: branch.merchant.id,
      merchantName: branch.merchant.name,
      branchId: branch.id,
      branchName: branch.name,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      serviceBufferMinutes: service.bufferMinutes,
      concurrentCapacity: branch.concurrentCapacity,
    },
  };
}

export async function resolveBookingCatalog(
  branchId: string,
  serviceId: string,
): Promise<BookingValidationResult> {
  const { errors, context } = await loadBookingCatalog(branchId, serviceId, {
    requireMarketplaceBookable: true,
  });

  if (!context) {
    return { ok: false, errors };
  }

  return { ok: true, context };
}

async function isBookingSlotAvailable(
  context: BookingCreateContext,
  bookingDate: Date,
): Promise<boolean> {
  const date = [
    bookingDate.getFullYear(),
    String(bookingDate.getMonth() + 1).padStart(2, "0"),
    String(bookingDate.getDate()).padStart(2, "0"),
  ].join("-");

  const availableSlots = await getAvailableSlots(
    context.branchId,
    context.serviceId,
    date,
  );

  return availableSlots.some(
    (slot) => new Date(slot.startTime).getTime() === bookingDate.getTime(),
  );
}

export async function validateBookingCreation(
  input: BookingCreateInput,
): Promise<BookingValidationResult> {
  const errors: string[] = [];

  if (Number.isNaN(input.bookingDate.getTime())) {
    errors.push("Booking date and time is invalid.");
  } else if (!input.allowWalkIn && input.bookingDate <= new Date()) {
    errors.push("Booking date and time must be in the future.");
  }

  const catalog = await loadBookingCatalog(input.branchId, input.serviceId, {
    requireMarketplaceBookable: !input.allowWalkIn,
  });

  if (!catalog.context) {
    return { ok: false, errors: [...errors, ...catalog.errors] };
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!input.allowWalkIn) {
    const slotAvailable = await isBookingSlotAvailable(
      catalog.context,
      input.bookingDate,
    );

    if (!slotAvailable) {
      return {
        ok: false,
        errors: [
          "This time slot is no longer available. Choose another available slot.",
        ],
      };
    }
  }

  const { start: dayStart, end: dayEnd } = getDayBounds(
    [
      input.bookingDate.getFullYear(),
      String(input.bookingDate.getMonth() + 1).padStart(2, "0"),
      String(input.bookingDate.getDate()).padStart(2, "0"),
    ].join("-"),
  );

  const existingBookings = await prisma.booking.findMany({
    where: {
      branchId: catalog.context.branchId,
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

  const overlapCount = countOverlappingBookings(
    input.bookingDate,
    catalog.context.serviceDuration,
    catalog.context.serviceBufferMinutes,
    existingBookings,
  );

  if (
    !isSlotCapacityAvailable(overlapCount, catalog.context.concurrentCapacity)
  ) {
    return {
      ok: false,
      errors: [
        "This time slot is no longer available. Choose another available slot.",
      ],
    };
  }

  return { ok: true, context: catalog.context };
}
