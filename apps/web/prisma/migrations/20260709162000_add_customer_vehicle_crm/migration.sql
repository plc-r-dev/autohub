-- AlterTable
ALTER TABLE "Customer"
ADD COLUMN "lineDisplayName" TEXT,
ADD COLUMN "linePictureUrl" TEXT,
ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN "province" TEXT,
ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "vehicleId" TEXT;

-- Backfill one placeholder vehicle per customer that has bookings but no vehicle
INSERT INTO "Vehicle" (
  "id",
  "customerId",
  "brand",
  "model",
  "licensePlate",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  c.id,
  'UNKNOWN',
  'UNKNOWN',
  'UNKNOWN-' || substr(c.id, 1, 8),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Customer" c
WHERE EXISTS (
  SELECT 1 FROM "Booking" b WHERE b."customerId" = c.id
)
AND NOT EXISTS (
  SELECT 1 FROM "Vehicle" v WHERE v."customerId" = c.id
);

-- Backfill booking.vehicleId from first customer vehicle
UPDATE "Booking" b
SET "vehicleId" = sub."vehicleId"
FROM (
  SELECT DISTINCT ON (v."customerId")
    v."customerId",
    v."id" AS "vehicleId"
  FROM "Vehicle" v
  ORDER BY v."customerId", v."createdAt" ASC
) AS sub
WHERE b."customerId" = sub."customerId"
  AND b."vehicleId" IS NULL;

ALTER TABLE "Booking" ALTER COLUMN "vehicleId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_vehicleId_idx" ON "Booking"("vehicleId");

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
