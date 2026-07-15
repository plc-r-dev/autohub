import { registerJob } from "@/lib/jobs/registry";
import { runBillingDueReminderService } from "@/lib/jobs/services/billing-due-reminder-job";
import { runMonthlyBillingGenerationService } from "@/lib/jobs/services/monthly-billing-job";
import { runPendingBookingExpirationService } from "@/lib/jobs/services/pending-booking-expiration-job";
import { runStorageCleanupService } from "@/lib/jobs/services/storage-cleanup-job";

const globalForJobs = globalThis as unknown as {
  autohubJobsInitialized?: boolean;
};

export function ensureJobDefinitionsRegistered() {
  if (globalForJobs.autohubJobsInitialized) {
    return;
  }

  registerJob({
    name: "monthly-billing-generation",
    description: "Generate monthly billings for the previous month.",
    schedule: {
      kind: "cron",
      expression: "5 0 1 * *",
      humanReadable: "1st day of every month at 00:05",
      timezone: "Asia/Bangkok",
    },
    async execute() {
      const result = await runMonthlyBillingGenerationService();
      return {
        status: result.createdCount === 0 ? "SKIPPED" : "SUCCESS",
        message: `Created ${result.createdCount} billings, skipped ${result.skippedCount}.`,
      };
    },
  });

  registerJob({
    name: "pending-booking-expiration",
    description: "Cancel expired pending bookings.",
    schedule: {
      kind: "cron",
      expression: "*/5 * * * *",
      humanReadable: "Every 5 minutes",
      timezone: "Asia/Bangkok",
    },
    async execute() {
      const result = await runPendingBookingExpirationService();
      return {
        status: result.cancelledCount === 0 ? "SKIPPED" : "SUCCESS",
        message: `Cancelled ${result.cancelledCount} pending bookings.`,
      };
    },
  });

  registerJob({
    name: "billing-due-reminder",
    description: "Generate reminder events for overdue billings.",
    schedule: {
      kind: "cron",
      expression: "0 0 * * *",
      humanReadable: "Daily at 00:00",
      timezone: "Asia/Bangkok",
    },
    async execute() {
      const result = await runBillingDueReminderService();
      return {
        status: result.eventCount === 0 ? "SKIPPED" : "SUCCESS",
        message: `Generated ${result.eventCount} reminder events for today.`,
      };
    },
  });

  registerJob({
    name: "storage-cleanup",
    description: "Delete orphaned uploaded files.",
    schedule: {
      kind: "cron",
      expression: "0 0 * * *",
      humanReadable: "Daily at 00:00",
      timezone: "Asia/Bangkok",
    },
    async execute() {
      const result = await runStorageCleanupService();
      return {
        status: result.deletedCount === 0 ? "SKIPPED" : "SUCCESS",
        message: `Deleted ${result.deletedCount} orphaned files.`,
      };
    },
  });

  globalForJobs.autohubJobsInitialized = true;
}
