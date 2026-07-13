import { Suspense } from "react"
import { Receipt } from "lucide-react"
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell"
import { BillingsPageFilters } from "@/components/listing/management/filters/billings-page-filters"
import {
  ManagementDataTable,
  ManagementRowLink,
  type ManagementTableColumn,
} from "@/components/listing/management"
import { ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import {
  formatBillingCurrency,
  formatBillingDate,
} from "@/lib/billing/format"
import {
  billingStatusLabel,
  getServiceStoreBillingsPaginated,
} from "@/lib/billing/queries"
import type { BillingStatus } from "@/lib/generated/prisma/client"
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params"

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    sort?: string
    page?: string
    pageSize?: string
  }>
}

type BillingRow = Awaited<
  ReturnType<typeof getServiceStoreBillingsPaginated>
>["rows"][number]

const columns: ManagementTableColumn<BillingRow>[] = [
  {
    key: "period",
    header: "Period",
    render: (billing) => (
      <span className="font-medium text-foreground">
        {formatBillingDate(billing.periodStart)} – {formatBillingDate(billing.periodEnd)}
      </span>
    ),
  },
  {
    key: "bookings",
    header: "Bookings",
    render: (billing) => (
      <span className="text-muted-foreground">{billing.bookingCount}</span>
    ),
  },
  {
    key: "total",
    header: "Total",
    render: (billing) => (
      <span className="font-semibold text-foreground">
        {formatBillingCurrency(billing.total)}
      </span>
    ),
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
]

export default async function ServiceStoreBillingsPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const params = await searchParams
  const { page, pageSize } = parseListPaging(params)
  const sort = parseSortOrder(params.sort)
  const { totalCount, rows } = await getServiceStoreBillingsPaginated(serviceStore.id, {
    q: params.q,
    status: params.status as BillingStatus | undefined,
    page,
    pageSize,
    sort,
  })

  const hasFilters = Boolean(params.q || params.status)

  return (
    <PageShell title="Billings" nav={serviceStoreNav}>
      <div className="space-y-5">
        <Suspense fallback={null}>
          <BillingsPageFilters hasActiveFilters={hasFilters} />
        </Suspense>

        <ManagementDataTable
          rows={rows}
          columns={columns}
          getRowKey={(billing) => billing.id}
          rowHref={(billing) => `/app/billings/${billing.id}`}
          emptyIcon={Receipt}
          emptyMessage="No billings yet."
          filteredEmptyMessage="No billings match your filters."
          hasFilters={hasFilters}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchParams={params}
          itemLabel="billings"
          actionColumn={{
            render: (billing) => (
              <ManagementRowLink href={`/app/billings/${billing.id}`}>View</ManagementRowLink>
            ),
          }}
        />
      </div>
    </PageShell>
  )
}
