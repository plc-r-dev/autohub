import { prisma } from "@/lib/prisma";

function getDayStart(value: Date): Date {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}

export async function runBillingDueReminderService(now = new Date()) {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
    select: { billingDueDays: true },
  });

  const dueDays = settings?.billingDueDays ?? 30;
  const threshold = new Date(now.getTime() - dueDays * 24 * 60 * 60 * 1000);
  const reminderDate = getDayStart(now);

  const overdueBillings = await prisma.billing.findMany({
    where: {
      status: { in: ["PENDING", "REJECTED"] },
      createdAt: { lt: threshold },
    },
    select: { id: true, createdAt: true },
    take: 5000,
  });

  if (overdueBillings.length === 0) {
    return { eventCount: 0 };
  }

  await prisma.billingReminderEvent.createMany({
    data: overdueBillings.map((billing) => ({
      billingId: billing.id,
      reminderDate,
      dueDate: new Date(
        billing.createdAt.getTime() + dueDays * 24 * 60 * 60 * 1000,
      ),
    })),
    skipDuplicates: true,
  });

  const eventCount = await prisma.billingReminderEvent.count({
    where: { reminderDate },
  });

  return { eventCount };
}
