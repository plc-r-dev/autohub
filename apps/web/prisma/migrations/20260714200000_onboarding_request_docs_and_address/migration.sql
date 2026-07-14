-- AlterTable
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(65,30);
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(65,30);
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "citizenIdKey" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "citizenIdUrl" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "citizenIdFileName" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "citizenIdFileSize" INTEGER;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "citizenIdMimeType" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "companyDocumentKey" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "companyDocumentUrl" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "companyDocumentFileName" TEXT;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "companyDocumentFileSize" INTEGER;
ALTER TABLE "ServiceStoreOnboardingRequest" ADD COLUMN IF NOT EXISTS "companyDocumentMimeType" TEXT;

UPDATE "ServiceStoreOnboardingRequest"
SET
  "citizenIdKey" = COALESCE("citizenIdKey", 'legacy/missing-citizen-id'),
  "citizenIdUrl" = COALESCE("citizenIdUrl", ''),
  "citizenIdFileName" = COALESCE("citizenIdFileName", 'missing'),
  "citizenIdFileSize" = COALESCE("citizenIdFileSize", 0),
  "citizenIdMimeType" = COALESCE("citizenIdMimeType", 'application/octet-stream'),
  "companyDocumentKey" = COALESCE("companyDocumentKey", 'legacy/missing-store-document'),
  "companyDocumentUrl" = COALESCE("companyDocumentUrl", ''),
  "companyDocumentFileName" = COALESCE("companyDocumentFileName", 'missing'),
  "companyDocumentFileSize" = COALESCE("companyDocumentFileSize", 0),
  "companyDocumentMimeType" = COALESCE("companyDocumentMimeType", 'application/octet-stream')
WHERE "citizenIdKey" IS NULL
   OR "companyDocumentKey" IS NULL;

ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "citizenIdKey" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "citizenIdUrl" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "citizenIdFileName" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "citizenIdFileSize" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "citizenIdMimeType" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "companyDocumentKey" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "companyDocumentUrl" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "companyDocumentFileName" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "companyDocumentFileSize" SET NOT NULL;
ALTER TABLE "ServiceStoreOnboardingRequest" ALTER COLUMN "companyDocumentMimeType" SET NOT NULL;
