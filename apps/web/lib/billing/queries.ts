import type { BillingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getMerchantBillings(merchantId: string) {
  return prisma.billing.findMany({
    where: { merchantId },
    select: {
      id: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      status: true,
      invoiceNumber: true,
      receiptNumber: true,
      submittedAt: true,
      approvedAt: true,
      paidAt: true,
    },
    orderBy: { periodStart: "desc" },
  });
}

type MerchantBillingListParams = {
  q?: string;
  status?: BillingStatus;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function getMerchantBillingsPaginated(
  merchantId: string,
  params: MerchantBillingListParams,
) {
  const keyword = params.q?.trim();
  const where = {
    merchantId,
    ...(params.status ? { status: params.status } : {}),
    ...(keyword
      ? {
          OR: [
            { invoiceNumber: { contains: keyword, mode: "insensitive" as const } },
            { receiptNumber: { contains: keyword, mode: "insensitive" as const } },
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

export async function getMerchantBilling(billingId: string, merchantId: string) {
  return prisma.billing.findFirst({
    where: { id: billingId, merchantId },
    include: {
      items: {
        orderBy: { bookingDate: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      merchant: {
        select: { name: true, code: true },
      },
    },
  });
}

export async function getAdminBillingsForReview() {
  return prisma.billing.findMany({
    where: {
      status: {
        in: ["SUBMITTED", "PAYMENT_SUBMITTED"],
      },
    },
    select: {
      id: true,
      status: true,
      periodStart: true,
      periodEnd: true,
      bookingCount: true,
      total: true,
      submittedAt: true,
      paymentSubmittedAt: true,
      merchant: { select: { name: true, code: true } },
    },
    orderBy: [{ status: "asc" }, { periodStart: "desc" }],
  });
}

type AdminBillingListParams = {
  q?: string;
  status?: BillingStatus;
  merchantId?: string;
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
          status: {
            in: ["SUBMITTED", "PAYMENT_SUBMITTED"] as BillingStatus[],
          },
        }),
    ...(params.merchantId ? { merchantId: params.merchantId } : {}),
    ...(keyword
      ? {
          OR: [
            { invoiceNumber: { contains: keyword, mode: "insensitive" as const } },
            { merchant: { name: { contains: keyword, mode: "insensitive" as const } } },
            { merchant: { code: { contains: keyword, mode: "insensitive" as const } } },
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
        submittedAt: true,
        paymentSubmittedAt: true,
        merchant: { select: { id: true, name: true, code: true } },
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
      merchant: { select: { id: true, name: true, code: true } },
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
  return status.replaceAll("_", " ");
}
