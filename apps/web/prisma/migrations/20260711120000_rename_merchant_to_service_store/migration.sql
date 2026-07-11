-- Rename Merchant domain to Service Store

-- Enum renames
ALTER TYPE "MerchantStatus" RENAME TO "ServiceStoreStatus";

-- Table renames
ALTER TABLE "Merchant" RENAME TO "ServiceStore";
ALTER TABLE "MerchantClaim" RENAME TO "ServiceStoreClaim";
ALTER TABLE "MerchantOnboardingRequest" RENAME TO "ServiceStoreOnboardingRequest";

-- Column renames on related tables
ALTER TABLE "User" RENAME COLUMN "merchantId" TO "serviceStoreId";
ALTER TABLE "Branch" RENAME COLUMN "merchantId" TO "serviceStoreId";
ALTER TABLE "Billing" RENAME COLUMN "merchantId" TO "serviceStoreId";
ALTER TABLE "ServiceStoreClaim" RENAME COLUMN "merchantId" TO "serviceStoreId";

-- ServiceStore.status column type already uses renamed enum via table rename

-- ServiceStoreMember role enum + table
CREATE TYPE "ServiceStoreMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'FINANCE', 'VIEWER');

CREATE TABLE "ServiceStoreMember" (
    "id" TEXT NOT NULL,
    "serviceStoreId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ServiceStoreMemberRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStoreMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceStoreMember_serviceStoreId_userId_key" ON "ServiceStoreMember"("serviceStoreId", "userId");
CREATE INDEX "ServiceStoreMember_userId_idx" ON "ServiceStoreMember"("userId");

ALTER TABLE "ServiceStoreMember" ADD CONSTRAINT "ServiceStoreMember_serviceStoreId_fkey" FOREIGN KEY ("serviceStoreId") REFERENCES "ServiceStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceStoreMember" ADD CONSTRAINT "ServiceStoreMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill memberships from existing user → service store links
INSERT INTO "ServiceStoreMember" ("id", "serviceStoreId", "userId", "role", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u."serviceStoreId",
    u."id",
    'OWNER'::"ServiceStoreMemberRole",
    NOW(),
    NOW()
FROM "User" u
WHERE u."serviceStoreId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Rename indexes (optional cleanup; PostgreSQL keeps old index names but they still work)
-- Unique constraints on Branch and Billing reference renamed columns automatically.
