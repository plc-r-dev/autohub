-- Service Store onboarding flow: statuses, Places, category, payout, claim proposals

ALTER TYPE "ServiceStoreStatus" ADD VALUE 'ONBOARDING';
ALTER TYPE "ServiceStoreStatus" ADD VALUE 'READY_FOR_BOOKING';

ALTER TABLE "ServiceStore"
  ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "businessCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutBankName" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutAccountName" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutAccountNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutBankBranch" TEXT;

ALTER TABLE "ServiceStoreClaim"
  ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "businessCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedName" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedWebsite" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "proposedLatitude" DECIMAL(65,30),
  ADD COLUMN IF NOT EXISTS "proposedLongitude" DECIMAL(65,30);
