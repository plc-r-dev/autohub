import { z } from "zod";

export const platformSettingsSchema = z.object({
  bookingFee: z.coerce.number().min(0, "Booking fee cannot be negative"),
  vatRate: z.coerce
    .number()
    .min(0, "VAT rate cannot be negative")
    .max(100, "VAT rate cannot exceed 100%"),
  currency: z.string().trim().min(3).max(3),
  billingDueDays: z.coerce.number().int().min(1).max(365),
  companyName: z.string().trim().max(200),
  taxId: z.string().trim().max(50),
  address: z.string().trim().max(500),
  bankName: z.string().trim().max(200),
  accountName: z.string().trim().max(200),
  accountNumber: z.string().trim().max(50),
  bankBranch: z.string().trim().max(200),
  storageProvider: z.enum(["local", "s3", "r2", "azure", "gcs"]),
  bucketName: z.string().trim().min(1).max(200),
  storageRegion: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value ?? ""),
  timeZone: z.string().trim().min(1).max(100),
  dateFormat: z.string().trim().min(1).max(50),
  timeFormat: z.string().trim().min(1).max(50),
});
