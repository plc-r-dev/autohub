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
