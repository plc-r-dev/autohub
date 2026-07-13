import { z } from "zod"

export const storeGeneralSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(200),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
})

export const storeServiceSchema = z.object({
  serviceId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  name: z.string().trim().min(1, "Service name is required").max(200),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  duration: z.coerce.number().int().min(5, "Minimum 5 minutes").max(480),
  price: z.coerce.number().min(0, "Price must be positive"),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value !== "false"),
})

export function slugifyServiceCode(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

  return slug || `service-${Date.now()}`
}
