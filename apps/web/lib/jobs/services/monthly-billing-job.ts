import { generateBillingsForPeriod } from "@/lib/billing/service";

function getPreviousMonthPeriod(reference = new Date()) {
  const firstDayCurrentMonth = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const periodEnd = new Date(firstDayCurrentMonth.getTime() - 1);
  periodEnd.setHours(23, 59, 59, 999);
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1, 0, 0, 0, 0);
  return { periodStart, periodEnd };
}

export async function runMonthlyBillingGenerationService() {
  const { periodStart, periodEnd } = getPreviousMonthPeriod();
  const result = await generateBillingsForPeriod({ periodStart, periodEnd });
  return {
    createdCount: result.createdCount,
    skippedCount: result.skippedCount,
  };
}
