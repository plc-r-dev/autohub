import { z } from "zod";

export const createCustomerVehicleSchema = z.object({
  licensePlate: z.string().trim().min(1, "License plate is required."),
  province: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  brand: z.string().trim().min(1, "Brand is required."),
  model: z.string().trim().min(1, "Model is required."),
  year: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  color: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  returnTo: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});
