-- AlterTable
ALTER TABLE "Billing" ADD COLUMN "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable: migrate BillingPayment from binary storage to object storage metadata
ALTER TABLE "BillingPayment" ADD COLUMN "slipKey" TEXT;
ALTER TABLE "BillingPayment" ADD COLUMN "slipUrl" TEXT;
ALTER TABLE "BillingPayment" ADD COLUMN "fileName" TEXT;
ALTER TABLE "BillingPayment" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "BillingPayment" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "BillingPayment" ADD COLUMN "uploadedAt" TIMESTAMP(3);

-- Backfill legacy rows if any exist (orphaned metadata; files must be re-uploaded)
UPDATE "BillingPayment"
SET
  "slipKey" = 'legacy/' || "id",
  "slipUrl" = '',
  "fileName" = COALESCE("slipFileName", 'unknown'),
  "fileSize" = COALESCE(octet_length("slipFileData"), 0),
  "mimeType" = COALESCE("slipFileType", 'application/octet-stream'),
  "uploadedAt" = COALESCE("submittedAt", CURRENT_TIMESTAMP)
WHERE "slipKey" IS NULL;

ALTER TABLE "BillingPayment" ALTER COLUMN "slipKey" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "slipUrl" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "fileName" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "fileSize" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "mimeType" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "uploadedAt" SET NOT NULL;
ALTER TABLE "BillingPayment" ALTER COLUMN "uploadedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "BillingPayment" DROP COLUMN "slipFileName";
ALTER TABLE "BillingPayment" DROP COLUMN "slipFileType";
ALTER TABLE "BillingPayment" DROP COLUMN "slipFileData";

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "bookingFee" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "billingDueDays" INTEGER NOT NULL DEFAULT 30,
    "companyName" TEXT NOT NULL DEFAULT '',
    "taxId" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "accountName" TEXT NOT NULL DEFAULT '',
    "accountNumber" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "bucketName" TEXT NOT NULL DEFAULT 'autohub-uploads',
    "storageRegion" TEXT NOT NULL DEFAULT '',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    "dateFormat" TEXT NOT NULL DEFAULT 'medium',
    "timeFormat" TEXT NOT NULL DEFAULT 'short',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- Seed default platform settings
INSERT INTO "PlatformSettings" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
