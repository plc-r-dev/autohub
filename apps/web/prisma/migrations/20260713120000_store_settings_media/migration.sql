-- AlterTable
ALTER TABLE "ServiceStore" ADD COLUMN "address" TEXT;
ALTER TABLE "ServiceStore" ADD COLUMN "logoKey" TEXT;
ALTER TABLE "ServiceStore" ADD COLUMN "coverImageKey" TEXT;
ALTER TABLE "ServiceStore" ADD COLUMN "galleryImageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "description" TEXT;
ALTER TABLE "Service" ADD COLUMN "imageKey" TEXT;
