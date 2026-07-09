-- CreateEnum
CREATE TYPE "OnboardingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "MerchantOnboardingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessCode" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" "OnboardingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "MerchantOnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantOnboardingRequest_userId_idx" ON "MerchantOnboardingRequest"("userId");

-- CreateIndex
CREATE INDEX "MerchantOnboardingRequest_tenantId_idx" ON "MerchantOnboardingRequest"("tenantId");

-- CreateIndex
CREATE INDEX "MerchantOnboardingRequest_status_idx" ON "MerchantOnboardingRequest"("status");

-- AddForeignKey
ALTER TABLE "MerchantOnboardingRequest" ADD CONSTRAINT "MerchantOnboardingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOnboardingRequest" ADD CONSTRAINT "MerchantOnboardingRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
