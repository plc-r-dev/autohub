import { z } from "zod";

export const profileFieldsSchema = z.object({
  tenantId: z.string().uuid("Select a tenant"),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
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
});

export const customerOnboardingSchema = profileFieldsSchema;

export const merchantOnboardingSchema = z.discriminatedUnion("mode", [
  profileFieldsSchema.extend({
    mode: z.literal("claim"),
    merchantId: z.string().uuid("Select a business to claim"),
  }),
  profileFieldsSchema.extend({
    mode: z.literal("request"),
    businessName: z.string().trim().min(1, "Business name is required").max(200),
    businessCode: z
      .string()
      .trim()
      .min(2, "Business code must be at least 2 characters")
      .max(50)
      .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    businessPhone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    businessEmail: z
      .string()
      .trim()
      .email("Enter a valid business email")
      .max(255)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value === "" ? undefined : value)),
    website: z
      .string()
      .trim()
      .url("Enter a valid website URL")
      .max(255)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value === "" ? undefined : value)),
  }),
]);

export type CustomerOnboardingInput = z.infer<typeof customerOnboardingSchema>;
export type MerchantOnboardingInput = z.infer<typeof merchantOnboardingSchema>;
