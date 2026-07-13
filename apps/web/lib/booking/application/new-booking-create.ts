import type { BookingStatus } from "@/lib/generated/prisma/client";
import { generateBookingNumber } from "@/lib/booking/engine/booking-number";
import { validateBookingCreation } from "@/lib/booking/engine/validate-create";
import {
  type NewBookingFormInput,
  parseCustomerName,
} from "@/lib/booking/schemas/new-booking";
import { prisma } from "@/lib/prisma";

export type CreateNewBookingResult =
  | { ok: true; bookingNumber: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

function getInitialTimelineForStatus(status: BookingStatus, now = new Date()) {
  switch (status) {
    case "CONFIRMED":
      return { confirmedAt: now };
    case "IN_PROGRESS":
      return { confirmedAt: now, startedAt: now };
    case "COMPLETED":
      return { confirmedAt: now, startedAt: now, completedAt: now };
    case "CANCELLED":
      return { cancelledAt: now };
    default:
      return {};
  }
}

function normalizeVehicleField(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

export async function createNewBookingRecord(
  serviceStoreId: string,
  input: NewBookingFormInput,
): Promise<CreateNewBookingResult> {
  const bookingDate = new Date(input.bookingDate);
  if (Number.isNaN(bookingDate.getTime())) {
    return { ok: false, fieldErrors: { bookingDate: ["Date and time is invalid."] } };
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: input.branchId,
      serviceStoreId,
    },
    select: { id: true },
  });

  if (!branch) {
    return { ok: false, fieldErrors: { branchId: ["Branch not found."] } };
  }

  const validation = await validateBookingCreation({
    branchId: input.branchId!,
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
      return { ok: false, fieldErrors: { bookingDate: dateErrors } };
    }

    return { ok: false, error: validation.errors.join(" ") };
  }

  const { context } = validation;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      let customerId = input.customerId;

      if (customerId) {
        const existingCustomer = await tx.customer.findFirst({
          where: {
            id: customerId,
            tenantId: context.tenantId,
          },
          select: { id: true },
        });

        if (!existingCustomer) {
          throw new Error("CUSTOMER_NOT_FOUND");
        }
      } else {
        const { firstName, lastName } = parseCustomerName(input.customerName ?? "");
        const createdCustomer = await tx.customer.create({
          data: {
            tenantId: context.tenantId,
            firstName,
            lastName,
            phone: input.phone,
            isWalkIn: true,
          },
          select: { id: true },
        });
        customerId = createdCustomer.id;
      }

      let vehicleId = input.vehicleId;

      if (vehicleId) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: {
            id: vehicleId,
            customerId,
          },
          select: { id: true },
        });

        if (!existingVehicle) {
          throw new Error("VEHICLE_NOT_FOUND");
        }
      } else {
        const existingVehicle = await tx.vehicle.findFirst({
          where: {
            customerId,
            licensePlate: { equals: input.licensePlate, mode: "insensitive" },
          },
          select: { id: true },
        });

        if (existingVehicle) {
          vehicleId = existingVehicle.id;
        } else {
          const createdVehicle = await tx.vehicle.create({
            data: {
              customerId,
              licensePlate: input.licensePlate.trim(),
              brand: normalizeVehicleField(input.vehicleBrand),
              model: normalizeVehicleField(input.vehicleModel),
            },
            select: { id: true },
          });
          vehicleId = createdVehicle.id;
        }
      }

      const bookingNumber = await generateBookingNumber(tx, bookingDate);
      const timeline = getInitialTimelineForStatus(input.status);

      return tx.booking.create({
        data: {
          bookingNumber,
          tenantId: context.tenantId,
          customerId,
          vehicleId: vehicleId!,
          branchId: context.branchId,
          source: "WALK_IN",
          status: input.status,
          bookingDate,
          note: input.note,
          ...timeline,
          items: {
            create: {
              serviceId: context.serviceId,
              quantity: 1,
              unitPrice: context.servicePrice,
            },
          },
        },
        select: { bookingNumber: true },
      });
    });

    return { ok: true, bookingNumber: booking.bookingNumber };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CUSTOMER_NOT_FOUND") {
        return {
          ok: false,
          fieldErrors: { customerId: ["Customer not found."] },
        };
      }
      if (error.message === "VEHICLE_NOT_FOUND") {
        return {
          ok: false,
          fieldErrors: { vehicleId: ["Vehicle not found for this customer."] },
        };
      }
    }

    throw error;
  }
}
