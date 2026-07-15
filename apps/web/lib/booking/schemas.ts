import { z } from "zod";

export const createBookingSchema = z.object({
  branchId: z.string().uuid(),
  serviceId: z.string().uuid(),
  vehicleMode: z.enum(["existing", "new"]).default("existing"),
  vehicleId: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v))
    .pipe(z.string().uuid().optional()),
  vehicleLicensePlate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleProvince: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleBrand: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleModel: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleYear: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleColor: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  vehicleNotes: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  bookingDate: z.string().min(1, "Booking date is required"),
  note: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
}).superRefine((data, ctx) => {
  if (data.vehicleMode === "existing") {
    if (!data.vehicleId) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleId"],
        message: "Please select a vehicle.",
      });
    }
    return;
  }

  if (!data.vehicleLicensePlate) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicleLicensePlate"],
      message: "License plate is required.",
    });
  }
  if (!data.vehicleBrand) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicleBrand"],
      message: "Brand is required.",
    });
  }
  if (!data.vehicleModel) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicleModel"],
      message: "Model is required.",
    });
  }
});

export const walkInBookingSchema = z
  .object({
    branchId: z.string().uuid(),
    serviceId: z.string().uuid(),
    bookingDate: z.string().min(1, "Booking date is required"),
    note: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    customerType: z.enum(["existing", "temporary"]),
    vehicleMode: z.enum(["existing", "new"]).default("existing"),
    vehicleId: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .pipe(z.string().uuid().optional()),
    vehicleLicensePlate: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleProvince: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleBrand: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleModel: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleYear: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleColor: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    vehicleNotes: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    customerPhone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    firstName: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    lastName: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "existing") {
      if (!data.customerPhone) {
        ctx.addIssue({
          code: "custom",
          message: "Phone is required to find an existing customer.",
          path: ["customerPhone"],
        });
      }
      return;
    }

    if (!data.firstName) {
      ctx.addIssue({
        code: "custom",
        message: "First name is required.",
        path: ["firstName"],
      });
    }

    if (!data.lastName) {
      ctx.addIssue({
        code: "custom",
        message: "Last name is required.",
        path: ["lastName"],
      });
    }

    if (data.vehicleMode === "existing") {
      if (!data.vehicleId && !data.vehicleLicensePlate) {
        ctx.addIssue({
          code: "custom",
          path: ["vehicleLicensePlate"],
          message: "Provide vehicle plate for existing vehicle lookup.",
        });
      }
      return;
    }

    if (!data.vehicleLicensePlate) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleLicensePlate"],
        message: "License plate is required.",
      });
    }
    if (!data.vehicleBrand) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleBrand"],
        message: "Brand is required.",
      });
    }
    if (!data.vehicleModel) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleModel"],
        message: "Model is required.",
      });
    }
  });
