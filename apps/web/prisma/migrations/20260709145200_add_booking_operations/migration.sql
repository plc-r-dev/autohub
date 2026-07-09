-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Customer" ADD COLUMN "isWalkIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "bookingNumber" TEXT;
ALTER TABLE "Booking" ADD COLUMN "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "noShowAt" TIMESTAMP(3);

-- Backfill booking numbers for existing bookings
UPDATE "Booking" AS b
SET "bookingNumber" = sub.number
FROM (
  SELECT
    id,
    'AH-' || to_char("bookingDate", 'YYMMDD') || '-' ||
    lpad(
      row_number() OVER (
        PARTITION BY to_char("bookingDate", 'YYMMDD')
        ORDER BY "createdAt"
      )::text,
      6,
      '0'
    ) AS number
  FROM "Booking"
) AS sub
WHERE b.id = sub.id;

ALTER TABLE "Booking" ALTER COLUMN "bookingNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateTable
CREATE TABLE "BookingNumberCounter" (
    "dateKey" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL,

    CONSTRAINT "BookingNumberCounter_pkey" PRIMARY KEY ("dateKey")
);

-- Seed counters from existing bookings
INSERT INTO "BookingNumberCounter" ("dateKey", "lastNumber")
SELECT
  to_char("bookingDate", 'YYMMDD'),
  COUNT(*)::INTEGER
FROM "Booking"
GROUP BY to_char("bookingDate", 'YYMMDD');
