import { z } from "zod";

export const billingGenerationSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export const rejectBillingSchema = z.object({
  reason: z.string().trim().min(1, "Reject reason is required").max(1000),
});

/** Merchant payment submission: slip + date + optional reference. */
export const uploadPaymentSlipSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  referenceNumber: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});
