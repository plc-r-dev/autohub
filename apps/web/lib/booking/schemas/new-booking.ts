import { z } from "zod";
import type { BookingStatus } from "@/lib/generated/prisma/client";

export const NEW_BOOKING_STATUS_OPTIONS = [
  { value: "PENDING" as const, label: "Pending" },
  { value: "CONFIRMED" as const, label: "Confirmed" },
  { value: "IN_PROGRESS" as const, label: "In Service" },
  { value: "COMPLETED" as const, label: "Completed" },
  { value: "CANCELLED" as const, label: "Cancelled" },
] satisfies ReadonlyArray<{ value: BookingStatus; label: string }>;

const newBookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const newBookingFormSchema = z
  .object({
    branchId: z.string().uuid().optional(),
    serviceId: z.string().uuid({ message: "Service is required." }),
    bookingDate: z.string().min(1, "Date and time is required."),
    status: newBookingStatusSchema.default("CONFIRMED"),
    phone: z.string().trim().min(1, "Phone number is required."),
    customerId: z.string().uuid().optional(),
    customerName: z.string().trim().optional(),
    licensePlate: z.string().trim().min(1, "License plate is required."),
    vehicleId: z.string().uuid().optional(),
    vehicleBrand: z.string().trim().optional(),
    vehicleModel: z.string().trim().optional(),
    note: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
  })
  .superRefine((data, ctx) => {
    if (!data.customerId && !data.customerName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customerName"],
        message: "Customer name is required when no matching customer is found.",
      });
    }
  });

export type NewBookingFormValues = z.input<typeof newBookingFormSchema>;
export type NewBookingFormInput = z.infer<typeof newBookingFormSchema>;

export function parseCustomerName(fullName: string) {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "-" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim() || "-",
  };
}

export function formatCustomerDisplayName(firstName: string, lastName: string) {
  if (!lastName || lastName === "-") {
    return firstName;
  }
  return `${firstName} ${lastName}`.trim();
}
