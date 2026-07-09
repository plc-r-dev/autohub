-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAYMENT_SUBMITTED', 'PAYMENT_REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "BillingPaymentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "bookingFee" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "vat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "BillingStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "paymentSubmittedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "receiptNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPayment" (
    "id" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "bank" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "note" TEXT,
    "slipFileName" TEXT NOT NULL,
    "slipFileType" TEXT NOT NULL,
    "slipFileData" BYTEA NOT NULL,
    "reviewStatus" "BillingPaymentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceNumberCounter" (
    "monthKey" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL,

    CONSTRAINT "InvoiceNumberCounter_pkey" PRIMARY KEY ("monthKey")
);

-- CreateTable
CREATE TABLE "ReceiptNumberCounter" (
    "monthKey" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL,

    CONSTRAINT "ReceiptNumberCounter_pkey" PRIMARY KEY ("monthKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "Billing_invoiceNumber_key" ON "Billing"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Billing_receiptNumber_key" ON "Billing"("receiptNumber");

-- CreateIndex
CREATE INDEX "Billing_merchantId_idx" ON "Billing"("merchantId");

-- CreateIndex
CREATE INDEX "Billing_status_idx" ON "Billing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Billing_merchantId_periodStart_periodEnd_key" ON "Billing"("merchantId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "BillingItem_bookingId_key" ON "BillingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BillingItem_billingId_idx" ON "BillingItem"("billingId");

-- CreateIndex
CREATE INDEX "BillingItem_bookingId_idx" ON "BillingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BillingPayment_billingId_idx" ON "BillingPayment"("billingId");

-- CreateIndex
CREATE INDEX "BillingPayment_reviewStatus_idx" ON "BillingPayment"("reviewStatus");

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
