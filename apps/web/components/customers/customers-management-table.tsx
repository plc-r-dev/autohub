"use client"

import { Users } from "lucide-react"
import { AvatarInitials } from "@/components/dashboard/avatar-initials"
import { ManagementInteractiveDataTable } from "@/components/listing/management/data-table.client"
import { ManagementRowActionsMenu } from "@/components/listing/management/row-actions-menu"
import type { ManagementTableColumn } from "@/components/listing/management/data-table"
import { useServiceStoreModals } from "@/components/service-store/modals"

type CustomerRow = {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  vehicles: Array<{ licensePlate: string; brand: string; model: string }>
  _count: { bookings: number }
}

type CustomersManagementTableProps = {
  rows: CustomerRow[]
  hasFilters: boolean
  page: number
  pageSize: number
  totalCount: number
  searchParams: Record<string, string | undefined>
}

const columns: ManagementTableColumn<CustomerRow>[] = [
  {
    key: "name",
    header: "Customer",
    render: (customer) => (
      <div className="flex items-center gap-3">
        <AvatarInitials
          firstName={customer.firstName}
          lastName={customer.lastName}
          size="sm"
        />
        <span className="font-medium text-foreground">
          {customer.firstName} {customer.lastName}
        </span>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (customer) => (
      <span className="text-muted-foreground">{customer.phone ?? "—"}</span>
    ),
  },
  {
    key: "vehicles",
    header: "Vehicles",
    render: (customer) => (
      <span className="text-muted-foreground">
        {customer.vehicles.map((vehicle) => vehicle.licensePlate).join(", ") || "—"}
      </span>
    ),
  },
  {
    key: "bookings",
    header: "Bookings",
    className: "text-center",
    render: (customer) => (
      <span className="block font-medium text-foreground">{customer._count.bookings}</span>
    ),
  },
]

export function CustomersManagementTable({
  rows,
  hasFilters,
  page,
  pageSize,
  totalCount,
  searchParams,
}: CustomersManagementTableProps) {
  const { openCustomer } = useServiceStoreModals()

  return (
    <ManagementInteractiveDataTable
      rows={rows}
      columns={columns}
      getRowKey={(customer) => customer.id}
      onRowClick={(customer) => openCustomer(customer.id)}
      emptyIcon={Users}
      emptyMessage="No customers yet."
      filteredEmptyMessage="No customers match your search."
      hasFilters={hasFilters}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      searchParams={searchParams}
      itemLabel="customers"
      actionColumn={{
        render: (customer) => (
          <ManagementRowActionsMenu
            ariaLabel={`Actions for ${customer.firstName} ${customer.lastName}`}
            actions={[
              {
                key: "view",
                label: "View details",
                onSelect: () => openCustomer(customer.id),
              },
            ]}
          />
        ),
      }}
    />
  )
}
