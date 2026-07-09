"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  requireApprovedMerchantUser,
  requireDomainUser,
} from "@/lib/auth/domain-user";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import { generateBookingNumber } from "@/lib/booking/engine/booking-number";
import {
  assertBookingStatusTransition,
  getTimelineUpdateForStatus,
} from "@/lib/booking/engine/state-machine";
import { validateBookingCreation } from "@/lib/booking/engine/validate-create";
import { createBookingSchema, walkInBookingSchema } from "@/lib/booking/schemas";
import { requireCustomerForUser } from "@/lib/customer/context";
import {
  sendBookingCancelled,
  sendBookingCompleted,
  sendBookingConfirmed,
  sendBookingCreated,
  sendBookingNoShow,
  sendBookingStarted,
} from "@/lib/line/line-notification-service";
import { prisma } from "@/lib/prisma";

export type BookingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

function parseVehicleYear(value?: string): number | null {
  if (!value) {
    return null;
  }
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

function revalidateBookingPaths(bookingNumber: string) {
  revalidatePath("/merchant/bookings");
  revalidatePath(`/merchant/bookings/${bookingNumber}`);
  revalidatePath(`/bookings/${bookingNumber}`);
  revalidatePath("/bookings");
  revalidatePath("/merchant/dashboard");
}

async function transitionMerchantBooking(
  bookingNumber: string,
  merchantId: string,
  toStatus: BookingStatus,
) {
  const booking = await prisma.booking.findFirst({
    where: { bookingNumber, branch: { merchantId } },
    select: {
      bookingNumber: true,
      status: true,
      bookingDate: true,
      customer: {
        select: {
          lineUserId: true,
        },
      },
      branch: {
        select: {
          merchant: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    return { error: "Booking not found." };
  }

  const transition = assertBookingStatusTransition(booking.status, toStatus);
  if (!transition.ok) {
    return { error: transition.error };
  }

  await prisma.booking.update({
    where: { bookingNumber },
    data: {
      status: toStatus,
      ...getTimelineUpdateForStatus(toStatus),
    },
  });

  revalidateBookingPaths(booking.bookingNumber);

  const commonPayload = {
    recipientLineUserId: booking.customer.lineUserId,
    bookingNumber: booking.bookingNumber,
    merchantName: booking.branch.merchant.name,
    bookingDate: booking.bookingDate,
    status: toStatus.replaceAll("_", " "),
  };
  if (toStatus === "CONFIRMED") {
    await sendBookingConfirmed(commonPayload);
  }
  if (toStatus === "IN_PROGRESS") {
    await sendBookingStarted(commonPayload);
  }
  if (toStatus === "COMPLETED") {
    await sendBookingCompleted(commonPayload);
  }
  if (toStatus === "CANCELLED") {
    await sendBookingCancelled(commonPayload);
  }
  if (toStatus === "NO_SHOW") {
    await sendBookingNoShow(commonPayload);
  }

  const messages: Record<BookingStatus, string> = {
    PENDING: "Booking updated.",
    CONFIRMED: "Booking confirmed.",
    CHECKED_IN: "Booking updated.",
    IN_PROGRESS: "Service started.",
    COMPLETED: "Booking completed.",
    CANCELLED: "Booking cancelled.",
    NO_SHOW: "Booking marked as no-show.",
  };

  return { success: messages[toStatus] };
}

export async function createBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const { user } = await requireDomainUser();
  const parsed = createBookingSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    return {
      error:
        "Customer profile not found. Complete customer onboarding before booking.",
    };
  }

  const input = parsed.data;
  const bookingDate = new Date(input.bookingDate);

  const validation = await validateBookingCreation({
    branchId: input.branchId,
    serviceId: input.serviceId,
    bookingDate,
  });

  if (!validation.ok) {
    const dateErrors = validation.errors.filter(
      (message) =>
        message.toLowerCase().includes("date") ||
        message.toLowerCase().includes("time slot"),
    );
    const otherErrors = validation.errors.filter(
      (message) =>
        !message.toLowerCase().includes("date") &&
        !message.toLowerCase().includes("time slot"),
    );

    if (dateErrors.length > 0) {
      return { fieldErrors: { bookingDate: dateErrors } };
    }

    return { error: otherErrors.join(" ") || validation.errors.join(" ") };
  }

  const { context } = validation;

  const booking = await prisma.$transaction(async (tx) => {
    let vehicleId = input.vehicleId;

    if (input.vehicleMode === "existing") {
      const existingVehicle = await tx.vehicle.findFirst({
        where: {
          id: input.vehicleId,
          customerId: customer.id,
        },
        select: { id: true },
      });
      if (!existingVehicle) {
        throw new Error("VEHICLE_NOT_FOUND");
      }
      vehicleId = existingVehicle.id;
    } else {
      const duplicateVehicle = await tx.vehicle.findFirst({
        where: {
          customerId: customer.id,
          licensePlate: input.vehicleLicensePlate!,
        },
        select: { id: true },
      });
      if (duplicateVehicle) {
        throw new Error("VEHICLE_DUPLICATE");
      }

      const vehicle = await tx.vehicle.create({
        data: {
          customerId: customer.id,
          licensePlate: input.vehicleLicensePlate!,
          province: input.vehicleProvince,
          brand: input.vehicleBrand!,
          model: input.vehicleModel!,
          year: parseVehicleYear(input.vehicleYear),
          color: input.vehicleColor,
          notes: input.vehicleNotes,
        },
      });
      vehicleId = vehicle.id;
    }

    const bookingNumber = await generateBookingNumber(tx, bookingDate);

    return tx.booking.create({
      data: {
        bookingNumber,
        tenantId: context.tenantId,
        customerId: customer.id,
        vehicleId: vehicleId!,
        branchId: context.branchId,
        source: "AUTOHUB",
        status: "PENDING",
        bookingDate,
        note: input.note,
        items: {
          create: {
            serviceId: context.serviceId,
            quantity: 1,
            unitPrice: context.servicePrice,
          },
        },
      },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "VEHICLE_NOT_FOUND") {
      return null;
    }
    if (error instanceof Error && error.message === "VEHICLE_DUPLICATE") {
      return "VEHICLE_DUPLICATE";
    }
    throw error;
  });

  if (booking === "VEHICLE_DUPLICATE") {
    return {
      fieldErrors: {
        vehicleLicensePlate: ["This license plate already exists for your profile."],
      },
    };
  }

  if (!booking) {
    return {
      fieldErrors: {
        vehicleId: ["Selected vehicle was not found."],
      },
    };
  }

  revalidatePath("/bookings");
  const bookingNotification = await prisma.booking.findUnique({
    where: { id: booking.id },
    select: {
      bookingNumber: true,
      bookingDate: true,
      customer: { select: { lineUserId: true } },
      branch: { select: { merchant: { select: { name: true } } } },
      status: true,
    },
  });
  if (bookingNotification) {
    await sendBookingCreated({
      recipientLineUserId: bookingNotification.customer.lineUserId,
      bookingNumber: bookingNotification.bookingNumber,
      merchantName: bookingNotification.branch.merchant.name,
      bookingDate: bookingNotification.bookingDate,
      status: bookingNotification.status.replaceAll("_", " "),
    });
  }
  redirect(`/bookings/${booking.bookingNumber}`);
}

export async function createWalkInBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const { merchant } = await requireApprovedMerchantUser();
  const parsed = walkInBookingSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;
  const bookingDate = new Date(input.bookingDate);

  if (Number.isNaN(bookingDate.getTime())) {
    return { fieldErrors: { bookingDate: ["Booking date and time is invalid."] } };
  }

  const validation = await validateBookingCreation({
    branchId: input.branchId,
    serviceId: input.serviceId,
    bookingDate,
    allowWalkIn: true,
  });

  if (!validation.ok) {
    const dateErrors = validation.errors.filter(
      (message) =>
        message.toLowerCase().includes("date") ||
        message.toLowerCase().includes("time slot"),
    );

    if (dateErrors.length > 0) {
      return { fieldErrors: { bookingDate: dateErrors } };
    }

    return { error: validation.errors.join(" ") };
  }

  const branch = await prisma.branch.findFirst({
    where: { id: input.branchId, merchantId: merchant.id },
    select: { id: true },
  });

  if (!branch) {
    return { error: "Branch not found." };
  }

  const { context } = validation;
  const now = new Date();

  const booking = await prisma.$transaction(async (tx) => {
    let customerId: string;

    if (input.customerType === "existing") {
      const existingCustomer = await tx.customer.findFirst({
        where: {
          tenantId: context.tenantId,
          phone: input.customerPhone,
          isWalkIn: false,
        },
        select: { id: true },
      });

      if (!existingCustomer) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      customerId = existingCustomer.id;
    } else {
      const walkInCustomer = await tx.customer.create({
        data: {
          tenantId: context.tenantId,
          firstName: input.firstName!,
          lastName: input.lastName!,
          phone: input.phone,
          isWalkIn: true,
        },
      });

      customerId = walkInCustomer.id;
    }

    let vehicleId = input.vehicleId;
    if (input.vehicleMode === "existing") {
      const existingVehicle = await tx.vehicle.findFirst({
        where: {
          customerId,
          ...(input.vehicleId
            ? { id: input.vehicleId }
            : { licensePlate: input.vehicleLicensePlate }),
        },
        select: { id: true },
      });
      if (!existingVehicle) {
        throw new Error("VEHICLE_NOT_FOUND");
      }
      vehicleId = existingVehicle.id;
    } else {
      const duplicateVehicle = await tx.vehicle.findFirst({
        where: {
          customerId,
          licensePlate: input.vehicleLicensePlate!,
        },
        select: { id: true },
      });
      if (duplicateVehicle) {
        throw new Error("VEHICLE_DUPLICATE");
      }
      const vehicle = await tx.vehicle.create({
        data: {
          customerId,
          licensePlate: input.vehicleLicensePlate!,
          province: input.vehicleProvince,
          brand: input.vehicleBrand!,
          model: input.vehicleModel!,
          year: parseVehicleYear(input.vehicleYear),
          color: input.vehicleColor,
          notes: input.vehicleNotes,
        },
      });
      vehicleId = vehicle.id;
    }

    const bookingNumber = await generateBookingNumber(tx, bookingDate);

    return tx.booking.create({
      data: {
        bookingNumber,
        tenantId: context.tenantId,
        customerId,
        vehicleId: vehicleId!,
        branchId: context.branchId,
        source: "WALK_IN",
        status: "CONFIRMED",
        bookingDate,
        confirmedAt: now,
        note: input.note,
        items: {
          create: {
            serviceId: context.serviceId,
            quantity: 1,
            unitPrice: context.servicePrice,
          },
        },
      },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
      return null;
    }
    if (error instanceof Error && error.message === "VEHICLE_NOT_FOUND") {
      return null;
    }
    if (error instanceof Error && error.message === "VEHICLE_DUPLICATE") {
      return "VEHICLE_DUPLICATE";
    }

    throw error;
  });

  if (booking === "VEHICLE_DUPLICATE") {
    return {
      fieldErrors: {
        vehicleLicensePlate: ["Vehicle license plate already exists for this customer."],
      },
    };
  }

  if (!booking) {
    return {
      fieldErrors: {
        customerPhone: ["No registered customer found with this phone number."],
        vehicleId: ["Selected vehicle was not found."],
      },
    };
  }

  revalidateBookingPaths(booking.bookingNumber);
  const bookingNotification = await prisma.booking.findUnique({
    where: { id: booking.id },
    select: {
      bookingNumber: true,
      bookingDate: true,
      customer: { select: { lineUserId: true } },
      branch: { select: { merchant: { select: { name: true } } } },
      status: true,
    },
  });
  if (bookingNotification) {
    await sendBookingConfirmed({
      recipientLineUserId: bookingNotification.customer.lineUserId,
      bookingNumber: bookingNotification.bookingNumber,
      merchantName: bookingNotification.branch.merchant.name,
      bookingDate: bookingNotification.bookingDate,
      status: bookingNotification.status.replaceAll("_", " "),
    });
  }
  redirect(`/merchant/bookings/${booking.bookingNumber}`);
}

export async function confirmBooking(bookingNumber: string) {
  const { merchant } = await requireApprovedMerchantUser();
  return transitionMerchantBooking(bookingNumber, merchant.id, "CONFIRMED");
}

export async function startBooking(bookingNumber: string) {
  const { merchant } = await requireApprovedMerchantUser();
  return transitionMerchantBooking(bookingNumber, merchant.id, "IN_PROGRESS");
}

export async function cancelBookingAsMerchant(bookingNumber: string) {
  const { merchant } = await requireApprovedMerchantUser();
  return transitionMerchantBooking(bookingNumber, merchant.id, "CANCELLED");
}

export async function completeBooking(bookingNumber: string) {
  const { merchant } = await requireApprovedMerchantUser();
  return transitionMerchantBooking(bookingNumber, merchant.id, "COMPLETED");
}

export async function markBookingNoShow(bookingNumber: string) {
  const { merchant } = await requireApprovedMerchantUser();
  return transitionMerchantBooking(bookingNumber, merchant.id, "NO_SHOW");
}
