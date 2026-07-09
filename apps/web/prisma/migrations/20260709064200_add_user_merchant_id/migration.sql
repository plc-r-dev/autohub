-- AlterTable
ALTER TABLE "User" ADD COLUMN "merchantId" TEXT;

-- CreateIndex
CREATE INDEX "User_merchantId_idx" ON "User"("merchantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
