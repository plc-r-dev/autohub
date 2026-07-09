import { z } from "zod";

export const billingGenerationSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export const rejectBillingSchema = z.object({
  reason: z.string().trim().min(1, "Reject reason is required").max(1000),
});

export const uploadPaymentSlipSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  bank: z.string().trim().min(1, "Bank is required").max(200),
  referenceNumber: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  note: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});
