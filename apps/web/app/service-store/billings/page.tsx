import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import {
  formatBillingCurrency,
  formatBillingDate,
} from "@/lib/billing/format";
import {
  billingStatusLabel,
  getServiceStoreBillingsPaginated,
} from "@/lib/billing/queries";
import type { BillingStatus } from "@/lib/generated/prisma/client";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function ServiceStoreBillingsPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const { totalCount, rows } = await getServiceStoreBillingsPaginated(serviceStore.id, {
    q: params.q,
    status: params.status as BillingStatus | undefined,
    page,
    pageSize,
    sort,
  });

  return (
    <PageShell
      title="Billings"
      description="View monthly billing statements and payment history."
      nav={serviceStoreNav}
      backHref="/service-store/dashboard"
    >
      <ListToolbar
        searchPlaceholder="Search invoice or receipt"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              "DRAFT",
              "SUBMITTED",
              "APPROVED",
              "REJECTED",
              "PAYMENT_SUBMITTED",
              "PAID",
            ].map((status) => ({
              value: status,
              label: billingStatusLabel(status as BillingStatus),
            })),
          },
        ]}
      />
      <ListTable
        rows={rows}
        getRowKey={(billing) => billing.id}
        emptyLabel="No billings yet."
        hasFilters={Boolean(params.q || params.status)}
        columns={[
          {
            key: "period",
            header: "Period",
            render: (billing) =>
              `${formatBillingDate(billing.periodStart)} – ${formatBillingDate(billing.periodEnd)}`,
          },
          {
            key: "bookings",
            header: "Bookings",
            render: (billing) => billing.bookingCount,
          },
          {
            key: "total",
            header: "Total",
            render: (billing) => formatBillingCurrency(billing.total),
          },
          {
            key: "status",
            header: "Status",
            render: (billing) => (
              <ServiceStoreStatusBadge
                label={billingStatusLabel(billing.status)}
                status={billing.status}
              />
            ),
          },
          {
            key: "action",
            header: "",
            render: (billing) => (
              <Link
                href={`/service-store/billings/${billing.id}`}
                className="text-sm font-semibold text-[#0F9B76] underline-offset-2 hover:underline"
              >
                View
              </Link>
            ),
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
