-- Simplify billing lifecycle:
-- PENDING → PAYMENT_SUBMITTED → PAID | REJECTED (retry) | CANCELLED

CREATE TYPE "BillingStatus_new" AS ENUM (
  'PENDING',
  'PAYMENT_SUBMITTED',
  'PAID',
  'REJECTED',
  'CANCELLED'
);

ALTER TABLE "Billing" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Billing"
  ALTER COLUMN "status" TYPE "BillingStatus_new"
  USING (
    CASE
      WHEN "status"::text IN ('DRAFT', 'SUBMITTED', 'APPROVED') THEN 'PENDING'::"BillingStatus_new"
      WHEN "status"::text IN ('PAYMENT_REJECTED', 'REJECTED') THEN 'REJECTED'::"BillingStatus_new"
      WHEN "status"::text = 'PAYMENT_SUBMITTED' THEN 'PAYMENT_SUBMITTED'::"BillingStatus_new"
      WHEN "status"::text = 'PAID' THEN 'PAID'::"BillingStatus_new"
      ELSE 'PENDING'::"BillingStatus_new"
    END
  );

DROP TYPE "BillingStatus";
ALTER TYPE "BillingStatus_new" RENAME TO "BillingStatus";

ALTER TABLE "Billing"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"BillingStatus";
