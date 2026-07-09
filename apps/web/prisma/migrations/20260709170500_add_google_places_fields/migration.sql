-- AlterTable
ALTER TABLE "Merchant"
ADD COLUMN "googlePlaceId" TEXT,
ADD COLUMN "googleRating" DECIMAL(65,30),
ADD COLUMN "googleReviewCount" INTEGER,
ADD COLUMN "googleMapsUrl" TEXT,
ADD COLUMN "photoReferences" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_googlePlaceId_key" ON "Merchant"("googlePlaceId");
