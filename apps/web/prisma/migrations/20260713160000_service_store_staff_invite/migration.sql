-- CreateTable
CREATE TABLE "ServiceStoreStaffInvite" (
    "id" TEXT NOT NULL,
    "serviceStoreId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStoreStaffInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceStoreStaffInvite_serviceStoreId_key" ON "ServiceStoreStaffInvite"("serviceStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceStoreStaffInvite_token_key" ON "ServiceStoreStaffInvite"("token");

-- CreateIndex
CREATE INDEX "ServiceStoreStaffInvite_token_idx" ON "ServiceStoreStaffInvite"("token");

-- CreateIndex
CREATE INDEX "ServiceStoreStaffInvite_expiresAt_idx" ON "ServiceStoreStaffInvite"("expiresAt");

-- AddForeignKey
ALTER TABLE "ServiceStoreStaffInvite" ADD CONSTRAINT "ServiceStoreStaffInvite_serviceStoreId_fkey" FOREIGN KEY ("serviceStoreId") REFERENCES "ServiceStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStoreStaffInvite" ADD CONSTRAINT "ServiceStoreStaffInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
