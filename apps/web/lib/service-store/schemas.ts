import { z } from "zod";

const slugCode = z
  .string()
  .trim()
  .min(2, "Code must be at least 2 characters")
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only");

export const serviceStoreProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

const timeValue = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format");

export const branchSchema = z.object({
  code: slugCode,
  name: z.string().trim().min(1, "Name is required").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  slotIntervalMinutes: z.coerce
    .number()
    .int()
    .min(5, "Minimum 5 minutes")
    .max(120),
  concurrentCapacity: z.coerce
    .number()
    .int()
    .min(1, "Minimum capacity is 1")
    .max(50),
});

export const serviceSchema = z.object({
  code: slugCode,
  name: z.string().trim().min(1, "Name is required").max(200),
  duration: z.coerce.number().int().min(5, "Minimum 5 minutes").max(480),
  bufferMinutes: z.coerce
    .number()
    .int()
    .min(0, "Buffer time cannot be negative")
    .max(240),
  price: z.coerce.number().min(0, "Price must be positive"),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

export const branchOperatingHoursSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  openTime: timeValue,
  closeTime: timeValue,
  isClosed: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
