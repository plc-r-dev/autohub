-- CreateEnum
CREATE TYPE "JobExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "BillingReminderEvent" (
    "id" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingReminderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobExecution" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "JobExecutionStatus" NOT NULL,
    "message" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingReminderEvent_billingId_reminderDate_key" ON "BillingReminderEvent"("billingId", "reminderDate");

-- CreateIndex
CREATE INDEX "BillingReminderEvent_billingId_idx" ON "BillingReminderEvent"("billingId");

-- CreateIndex
CREATE INDEX "BillingReminderEvent_reminderDate_idx" ON "BillingReminderEvent"("reminderDate");

-- CreateIndex
CREATE INDEX "JobExecution_jobName_startedAt_idx" ON "JobExecution"("jobName", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "JobExecution_status_startedAt_idx" ON "JobExecution"("status", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "BillingReminderEvent" ADD CONSTRAINT "BillingReminderEvent_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
