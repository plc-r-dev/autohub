import type { BillingStatus } from "@/lib/generated/prisma/client";
import { BILLING_STATUS_LABELS } from "@/lib/billing/domain";
import {
  formatBillingPeriod,
  parseBillingPeriodKey,
  toBillingPeriodKey,
} from "@/lib/billing/format";
import { prisma } from "@/lib/prisma";

export async function getServiceStoreBillings(serviceStoreId: string) {
  return prisma.billing.findMany({
    where: { serviceStoreId },
    select: {
      id: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      status: true,
      invoiceNumber: true,
      receiptNumber: true,
      paymentSubmittedAt: true,
      paidAt: true,
    },
    orderBy: { periodStart: "desc" },
  });
}

type ServiceStoreBillingListParams = {
  period?: string;
  status?: BillingStatus;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function getServiceStoreBillingsPaginated(
  serviceStoreId: string,
  params: ServiceStoreBillingListParams,
) {
  const periodRange = parseBillingPeriodKey(params.period);
  const where = {
    serviceStoreId,
    ...(params.status ? { status: params.status } : {}),
    ...(periodRange
      ? {
          periodStart: {
            gte: periodRange.gte,
            lt: periodRange.lt,
          },
        }
      : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.billing.count({ where }),
    prisma.billing.findMany({
      where,
      select: {
        id: true,
        periodStart: true,
        periodEnd: true,
        bookingCount: true,
        total: true,
        status: true,
        invoiceNumber: true,
        receiptNumber: true,
      },
      orderBy: { periodStart: params.sort },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getServiceStoreBillingPeriodOptions(
  serviceStoreId: string,
) {
  const rows = await prisma.billing.findMany({
    where: { serviceStoreId },
    select: { periodStart: true },
    orderBy: { periodStart: "desc" },
  });

  const seen = new Set<string>();
  const options: Array<{ value: string; label: string }> = [];

  for (const row of rows) {
    const value = toBillingPeriodKey(row.periodStart);
    if (seen.has(value)) continue;
    seen.add(value);
    options.push({
      value,
      label: formatBillingPeriod(row.periodStart),
    });
  }

  return options;
}

export async function getServiceStoreBilling(
  billingId: string,
  serviceStoreId: string,
) {
  return prisma.billing.findFirst({
    where: { id: billingId, serviceStoreId },
    include: {
      items: {
        orderBy: { bookingDate: "asc" },
        include: {
          booking: {
            select: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  lineDisplayName: true,
                },
              },
              items: {
                select: {
                  service: { select: { name: true } },
                },
                take: 3,
              },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      serviceStore: {
        select: { name: true, code: true },
      },
    },
  });
}

export async function getAdminBillingsForReview() {
  return prisma.billing.findMany({
    where: {
      status: "PAYMENT_SUBMITTED",
    },
    select: {
      id: true,
      status: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      paymentSubmittedAt: true,
      serviceStore: { select: { name: true, code: true } },
    },
    orderBy: [{ paymentSubmittedAt: "asc" }, { periodStart: "desc" }],
  });
}

type AdminBillingListParams = {
  q?: string;
  status?: BillingStatus;
  serviceStoreId?: string;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function getAdminBillingsForReviewPaginated(
  params: AdminBillingListParams,
) {
  const keyword = params.q?.trim();
  const where = {
    ...(params.status
      ? { status: params.status }
      : {
          status: "PAYMENT_SUBMITTED" as BillingStatus,
        }),
    ...(params.serviceStoreId ? { serviceStoreId: params.serviceStoreId } : {}),
    ...(keyword
      ? {
          OR: [
            {
              invoiceNumber: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              serviceStore: {
                name: { contains: keyword, mode: "insensitive" as const },
              },
            },
            {
              serviceStore: {
                code: { contains: keyword, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.billing.count({ where }),
    prisma.billing.findMany({
      where,
      select: {
        id: true,
        status: true,
        periodStart: true,
        periodEnd: true,
        bookingCount: true,
        total: true,
        paymentSubmittedAt: true,
        serviceStore: { select: { id: true, name: true, code: true } },
      },
      orderBy: { periodStart: params.sort },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getAdminBillingDetail(billingId: string) {
  return prisma.billing.findUnique({
    where: { id: billingId },
    include: {
      serviceStore: { select: { id: true, name: true, code: true } },
      items: {
        orderBy: { bookingDate: "asc" },
      },
      payments: {
        orderBy: { submittedAt: "desc" },
      },
    },
  });
}

export function billingStatusLabel(status: BillingStatus): string {
  return BILLING_STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export type AdminBillingOperationsKpis = {
  pendingPayments: number;
  generatedThisMonth: number;
  outstandingAmount: number;
  paidAmount: number;
};

export async function getAdminBillingOperationsKpis(): Promise<AdminBillingOperationsKpis> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [pendingPayments, generatedThisMonth, aggregates] = await Promise.all([
    prisma.billing.count({ where: { status: "PAYMENT_SUBMITTED" } }),
    prisma.billing.count({
      where: {
        createdAt: { gte: monthStart, lt: nextMonthStart },
      },
    }),
    prisma.billing.groupBy({
      by: ["status"],
      _sum: { total: true },
    }),
  ]);

  let outstandingAmount = 0;
  let paidAmount = 0;
  for (const row of aggregates) {
    const amount = Number(row._sum.total?.toString() ?? 0);
    if (row.status === "PAID") {
      paidAmount += amount;
    } else if (row.status !== "CANCELLED") {
      outstandingAmount += amount;
    }
  }

  return {
    pendingPayments,
    generatedThisMonth,
    outstandingAmount,
    paidAmount,
  };
}

export type BillingGenerationEstimate = {
  estimatedStores: number;
  estimatedBookings: number;
  estimatedRevenue: number;
};

export async function getBillingGenerationEstimate(
  periodStart: Date,
  periodEnd: Date,
): Promise<BillingGenerationEstimate> {
  const [completedBookings, existingBillings, settings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { gte: periodStart, lte: periodEnd },
      },
      select: {
        id: true,
        branch: { select: { serviceStoreId: true } },
      },
    }),
    prisma.billing.findMany({
      where: { periodStart, periodEnd },
      select: { serviceStoreId: true },
    }),
    prisma.platformSettings.findUnique({
      where: { id: "default" },
      select: { bookingFee: true },
    }),
  ]);

  const existingStoreIds = new Set(
    existingBillings.map((row) => row.serviceStoreId),
  );
  const bookingsByStore = new Map<string, number>();

  for (const booking of completedBookings) {
    const storeId = booking.branch.serviceStoreId;
    if (existingStoreIds.has(storeId)) continue;
    bookingsByStore.set(storeId, (bookingsByStore.get(storeId) ?? 0) + 1);
  }

  const estimatedStores = bookingsByStore.size;
  let estimatedBookings = 0;
  for (const count of bookingsByStore.values()) {
    estimatedBookings += count;
  }

  const bookingFee = Number(settings?.bookingFee?.toString() ?? 10);
  return {
    estimatedStores,
    estimatedBookings,
    estimatedRevenue: bookingFee * estimatedBookings,
  };
}

export type AdminBillingHistoryBatch = {
  periodKey: string;
  periodStart: string;
  periodEnd: string;
  storeCount: number;
  totalAmount: number;
  status: "Complete" | "Partial" | "Open" | "Needs review";
};

export async function getAdminBillingHistoryBatches(): Promise<
  AdminBillingHistoryBatch[]
> {
  const rows = await prisma.billing.findMany({
    select: {
      periodStart: true,
      periodEnd: true,
      total: true,
      status: true,
    },
    orderBy: { periodStart: "desc" },
  });

  type Acc = {
    periodKey: string;
    periodStart: Date;
    periodEnd: Date;
    storeCount: number;
    totalAmount: number;
    paidCount: number;
    submittedCount: number;
    openCount: number;
  };

  const byPeriod = new Map<string, Acc>();

  for (const row of rows) {
    const periodKey = `${row.periodStart.toISOString()}|${row.periodEnd.toISOString()}`;
    const current = byPeriod.get(periodKey) ?? {
      periodKey: toBillingPeriodKey(row.periodStart),
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      storeCount: 0,
      totalAmount: 0,
      paidCount: 0,
      submittedCount: 0,
      openCount: 0,
    };
    current.storeCount += 1;
    current.totalAmount += Number(row.total.toString());
    if (row.status === "PAID") current.paidCount += 1;
    else if (row.status === "PAYMENT_SUBMITTED") current.submittedCount += 1;
    else if (row.status !== "CANCELLED") current.openCount += 1;
    byPeriod.set(periodKey, current);
  }

  return [...byPeriod.values()].map((batch) => {
    let status: AdminBillingHistoryBatch["status"] = "Open";
    if (batch.submittedCount > 0) status = "Needs review";
    else if (batch.paidCount === batch.storeCount && batch.storeCount > 0) {
      status = "Complete";
    } else if (batch.paidCount > 0) status = "Partial";

    return {
      periodKey: batch.periodKey,
      periodStart: batch.periodStart.toISOString(),
      periodEnd: batch.periodEnd.toISOString(),
      storeCount: batch.storeCount,
      totalAmount: batch.totalAmount,
      status,
    };
  });
}

export async function getAdminPaymentReviewRows() {
  return prisma.billing.findMany({
    where: { status: "PAYMENT_SUBMITTED" },
    select: {
      id: true,
      status: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      invoiceNumber: true,
      paymentSubmittedAt: true,
      serviceStore: { select: { name: true, code: true } },
    },
    orderBy: [{ paymentSubmittedAt: "asc" }, { periodStart: "desc" }],
  });
}

/** All billings for operational grids (payment review + history drill-down). */
export async function getAdminBillingOperationRows() {
  return prisma.billing.findMany({
    where: { status: { not: "CANCELLED" } },
    select: {
      id: true,
      status: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      invoiceNumber: true,
      paymentSubmittedAt: true,
      serviceStore: { select: { name: true, code: true } },
    },
    orderBy: [{ paymentSubmittedAt: "desc" }, { periodStart: "desc" }],
  });
}
