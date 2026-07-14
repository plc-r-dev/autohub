-- AlterTable
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "citizenIdKey" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "citizenIdUrl" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "citizenIdFileName" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "citizenIdFileSize" INTEGER;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "citizenIdMimeType" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "companyDocumentKey" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "companyDocumentUrl" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "companyDocumentFileName" TEXT;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "companyDocumentFileSize" INTEGER;
ALTER TABLE "ServiceStoreClaim" ADD COLUMN "companyDocumentMimeType" TEXT;

-- Backfill required columns for any existing rows, then enforce NOT NULL
UPDATE "ServiceStoreClaim"
SET
  "citizenIdKey" = COALESCE("citizenIdKey", 'legacy/missing-citizen-id'),
  "citizenIdUrl" = COALESCE("citizenIdUrl", ''),
  "citizenIdFileName" = COALESCE("citizenIdFileName", 'missing'),
  "citizenIdFileSize" = COALESCE("citizenIdFileSize", 0),
  "citizenIdMimeType" = COALESCE("citizenIdMimeType", 'application/octet-stream'),
  "companyDocumentKey" = COALESCE("companyDocumentKey", 'legacy/missing-company-document'),
  "companyDocumentUrl" = COALESCE("companyDocumentUrl", ''),
  "companyDocumentFileName" = COALESCE("companyDocumentFileName", 'missing'),
  "companyDocumentFileSize" = COALESCE("companyDocumentFileSize", 0),
  "companyDocumentMimeType" = COALESCE("companyDocumentMimeType", 'application/octet-stream')
WHERE "citizenIdKey" IS NULL
   OR "companyDocumentKey" IS NULL;

ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "citizenIdKey" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "citizenIdUrl" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "citizenIdFileName" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "citizenIdFileSize" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "citizenIdMimeType" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "companyDocumentKey" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "companyDocumentUrl" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "companyDocumentFileName" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "companyDocumentFileSize" SET NOT NULL;
ALTER TABLE "ServiceStoreClaim" ALTER COLUMN "companyDocumentMimeType" SET NOT NULL;
