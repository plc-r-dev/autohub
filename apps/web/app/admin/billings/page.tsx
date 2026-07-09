import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminBillingGenerationForm } from "@/components/billing/admin-billing-generation-form";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import {
  formatBillingCurrency,
  formatBillingDate,
} from "@/lib/billing/format";
import {
  billingStatusLabel,
  getAdminBillingsForReviewPaginated,
} from "@/lib/billing/queries";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { getPlatformSettings } from "@/lib/platform-settings/queries";
import type { BillingStatus } from "@/lib/generated/prisma/client";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";

function getDefaultPreviousMonthPeriod() {
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(firstOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000);
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
  return { periodStart, periodEnd };
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    merchantId?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function AdminBillingsPage({ searchParams }: PageProps) {
  await requireLinkedIdentity();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const [listResult, platformSettings, merchants] = await Promise.all([
    getAdminBillingsForReviewPaginated({
      q: params.q,
      status: params.status as BillingStatus | undefined,
      merchantId: params.merchantId,
      page,
      pageSize,
      sort,
    }),
    getPlatformSettings(),
    prisma.merchant.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const { periodStart, periodEnd } = getDefaultPreviousMonthPeriod();

  return (
    <AdminLayout
      title="Billing review"
      description="Generate monthly billings and review submitted statements and payments."
    >
      <AdminBillingGenerationForm
        defaultPeriodStart={toDateInputValue(periodStart)}
        defaultPeriodEnd={toDateInputValue(periodEnd)}
        bookingFee={platformSettings.bookingFee.toString()}
        vatRate={platformSettings.vatRate.toString()}
        currency={platformSettings.currency}
      />

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Needs review</h2>
        <ListToolbar
          searchPlaceholder="Search merchant code or invoice"
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                "SUBMITTED",
                "PAYMENT_SUBMITTED",
                "APPROVED",
                "REJECTED",
                "PAID",
              ].map((status) => ({
                value: status,
                label: billingStatusLabel(status as BillingStatus),
              })),
            },
            {
              key: "merchantId",
              label: "Merchant",
              options: merchants.map((merchant) => ({
                value: merchant.id,
                label: merchant.name,
              })),
            },
          ]}
        />
        <ListTable
          rows={listResult.rows}
          getRowKey={(billing) => billing.id}
          emptyLabel="No billings pending review."
          hasFilters={Boolean(params.q || params.status || params.merchantId)}
          columns={[
            {
              key: "merchant",
              header: "Merchant",
              render: (billing) => billing.merchant.name,
            },
            {
              key: "period",
              header: "Period",
              render: (billing) =>
                `${formatBillingDate(billing.periodStart)} - ${formatBillingDate(billing.periodEnd)}`,
            },
            {
              key: "status",
              header: "Status",
              render: (billing) => billingStatusLabel(billing.status),
            },
            {
              key: "total",
              header: "Total",
              render: (billing) => formatBillingCurrency(billing.total),
            },
            {
              key: "action",
              header: "Action",
              render: (billing) => (
                <Link href={`/admin/billings/${billing.id}`} className="underline-offset-2 hover:underline">
                  Review detail
                </Link>
              ),
            },
          ]}
        />
        <ListPagination
          page={page}
          pageSize={pageSize}
          totalCount={listResult.totalCount}
          searchParams={params}
        />
      </section>
    </AdminLayout>
  );
}
