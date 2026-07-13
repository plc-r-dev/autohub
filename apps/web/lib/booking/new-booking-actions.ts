"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { createNewBookingRecord } from "@/lib/booking/application/new-booking-create";
import { getNewBookingFormOptions } from "@/lib/booking/application/new-booking-options";
import {
  lookupCustomerByPhone,
  lookupVehicleByPlate,
} from "@/lib/booking/application/new-booking-lookups";
import { newBookingFormSchema } from "@/lib/booking/schemas/new-booking";
import {
  sendBookingCancelled,
  sendBookingCompleted,
  sendBookingConfirmed,
  sendBookingCreated,
  sendBookingStarted,
} from "@/lib/line/line-notification-service";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type NewBookingActionResult =
  | { ok: true; bookingNumber: string; message: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

function revalidateBookingPaths(bookingNumber: string) {
  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingNumber}`);
  revalidatePath("/app/dashboard");
}

async function sendStatusNotification(
  bookingNumber: string,
  status: BookingStatus,
) {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber },
    select: {
      bookingNumber: true,
      bookingDate: true,
      status: true,
      customer: { select: { lineUserId: true } },
      branch: { select: { serviceStore: { select: { name: true } } } },
    },
  });

  if (!booking) {
    return;
  }

  const payload = {
    recipientLineUserId: booking.customer.lineUserId,
    bookingNumber: booking.bookingNumber,
    serviceStoreName: booking.branch.serviceStore.name,
    bookingDate: booking.bookingDate,
    status: booking.status.replaceAll("_", " "),
  };

  switch (status) {
    case "PENDING":
      await sendBookingCreated(payload);
      break;
    case "CONFIRMED":
      await sendBookingConfirmed(payload);
      break;
    case "IN_PROGRESS":
      await sendBookingStarted(payload);
      break;
    case "COMPLETED":
      await sendBookingCompleted(payload);
      break;
    case "CANCELLED":
      await sendBookingCancelled(payload);
      break;
    default:
      break;
  }
}

export async function searchNewBookingCustomerByPhone(
  phone: string,
) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  return lookupCustomerByPhone(serviceStore.id, phone);
}

export async function searchNewBookingVehicleByPlate(
  customerId: string,
  licensePlate: string,
) {
  await requireApprovedServiceStoreUser();
  return lookupVehicleByPlate(customerId, licensePlate);
}

export async function refreshNewBookingFormOptions() {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  return getNewBookingFormOptions(serviceStore.id);
}

export async function createNewBooking(
  input: unknown,
  defaultBranchId: string | null,
): Promise<NewBookingActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const parsed = newBookingFormSchema.safeParse({
    ...(typeof input === "object" && input !== null ? input : {}),
    branchId:
      typeof input === "object" &&
      input !== null &&
      "branchId" in input &&
      input.branchId
        ? input.branchId
        : defaultBranchId ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.branchId) {
    return { ok: false, fieldErrors: { branchId: ["Branch is required."] } };
  }

  const result = await createNewBookingRecord(serviceStore.id, {
    ...parsed.data,
    branchId: parsed.data.branchId,
  });

  if (!result.ok) {
    return result;
  }

  revalidateBookingPaths(result.bookingNumber);
  await sendStatusNotification(result.bookingNumber, parsed.data.status);

  return {
    ok: true,
    bookingNumber: result.bookingNumber,
    message: `Booking ${result.bookingNumber} created.`,
  };
}
