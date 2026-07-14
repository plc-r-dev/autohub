import { z } from "zod";
import { SERVICE_STORE_BUSINESS_CATEGORIES } from "@/lib/service-store/domain";

const categoryIds = SERVICE_STORE_BUSINESS_CATEGORIES.map((row) => row.id) as [
  string,
  ...string[],
];

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

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid website URL")
  .max(255)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .max(255)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const serviceStoreClaimSchema = profileFieldsSchema.extend({
  serviceStoreId: z.string().uuid("Select a business to claim"),
  googlePlaceId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  businessCategory: z.enum(categoryIds, { message: "Select a business category" }),
  proposedName: z.string().trim().min(1, "Business name is required").max(200),
  proposedPhone: z.string().trim().min(1, "Phone is required").max(30),
  proposedAddress: z.string().trim().min(1, "Address is required").max(500),
  proposedLatitude: z.coerce.number().min(-90).max(90),
  proposedLongitude: z.coerce.number().min(-180).max(180),
  proposedDescription: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  proposedEmail: optionalEmail,
  proposedWebsite: optionalUrl,
});

export const serviceStoreCreateSchema = z.object({
  tenantId: z.string().uuid("Select a tenant"),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(30),
  businessName: z.string().trim().min(1, "Store name is required").max(200),
  address: z.string().trim().min(1, "Address is required").max(500),
  googleMapsUrl: z
    .string()
    .trim()
    .url("Enter a valid Google Maps link")
    .max(2000),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
});

/** @deprecated Legacy single-form schema */
export const serviceStoreOnboardingSchema = z.discriminatedUnion("mode", [
  profileFieldsSchema.extend({
    mode: z.literal("claim"),
    serviceStoreId: z.string().uuid("Select a business to claim"),
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
    businessEmail: optionalEmail,
    website: optionalUrl,
  }),
]);

export type CustomerOnboardingInput = z.infer<typeof customerOnboardingSchema>;
export type ServiceStoreClaimInput = z.infer<typeof serviceStoreClaimSchema>;
export type ServiceStoreCreateInput = z.infer<typeof serviceStoreCreateSchema>;
export type ServiceStoreOnboardingInput = z.infer<typeof serviceStoreOnboardingSchema>;
