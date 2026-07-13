import { Suspense } from "react"
import { CustomersManagementTable } from "@/components/customers/customers-management-table"
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell"
import { CustomersPageFilters } from "@/components/listing/management/filters/customers-page-filters"
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { searchServiceStoreCustomersPaginated } from "@/lib/customer/queries"
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params"

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; pageSize?: string; customerId?: string; vehicleId?: string }>
}

export default async function ServiceStoreCustomersPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const params = await searchParams
  const { page, pageSize } = parseListPaging(params)
  const sort = parseSortOrder(params.sort)
  const { totalCount, rows } = await searchServiceStoreCustomersPaginated(serviceStore.id, {
    q: params.q,
    page,
    pageSize,
    sort,
  })

  const hasFilters = Boolean(params.q)

  return (
    <PageShell title="Customers" nav={serviceStoreNav}>
      <div className="space-y-5">
        <Suspense fallback={null}>
          <CustomersPageFilters hasActiveFilters={hasFilters} />
        </Suspense>

        <CustomersManagementTable
          rows={rows}
          hasFilters={hasFilters}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchParams={params}
        />
      </div>
    </PageShell>
  )
}
