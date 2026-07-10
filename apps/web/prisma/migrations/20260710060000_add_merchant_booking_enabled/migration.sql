-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN "bookingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Existing active merchants remain bookable once claim/setup rules pass.
UPDATE "Merchant" SET "bookingEnabled" = true WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "Merchant_bookingEnabled_idx" ON "Merchant"("bookingEnabled");
