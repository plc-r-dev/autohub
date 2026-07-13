"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Wrench } from "lucide-react"
import { ManagementInteractiveDataTable } from "@/components/listing/management/data-table.client"
import { ManagementRowActionsMenu } from "@/components/listing/management/row-actions-menu"
import type { ManagementTableColumn } from "@/components/listing/management/data-table"
import { ServiceFormModal, type ServiceFormValues } from "@/components/store-settings/service-form-modal"
import { ServiceStoreButton, ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { formatPrice } from "@/lib/booking/format"
import { deleteStoreService } from "@/lib/service-store/store-settings-actions"
import type { StoreSettingsServiceRow } from "@/lib/service-store/store-settings-queries"

type StoreServicesTabProps = {
  services: StoreSettingsServiceRow[]
  hasFilters: boolean
  page: number
  pageSize: number
  totalCount: number
  searchParams: Record<string, string | undefined>
}

const columns: ManagementTableColumn<StoreSettingsServiceRow>[] = [
  {
    key: "image",
    header: "",
    className: "w-16",
    render: (service) => (
      <div className="relative size-11 overflow-hidden rounded-lg border border-border bg-muted/30">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
            —
          </div>
        )}
      </div>
    ),
  },
  {
    key: "name",
    header: "Service",
    render: (service) => (
      <div className="min-w-0">
        <p className="font-medium text-foreground">{service.name}</p>
        {service.description ? (
          <p className="truncate text-xs text-muted-foreground">{service.description}</p>
        ) : null}
      </div>
    ),
  },
  {
    key: "duration",
    header: "Duration",
    render: (service) => (
      <span className="text-muted-foreground">{service.duration} min</span>
    ),
  },
  {
    key: "price",
    header: "Price",
    render: (service) => (
      <span className="font-semibold text-foreground">{formatPrice(service.price)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (service) => (
      <ServiceStoreStatusBadge
        label={service.isActive ? "Active" : "Inactive"}
        status={service.isActive ? "ACTIVE" : "CANCELLED"}
      />
    ),
  },
]

export function StoreServicesTab({
  services,
  hasFilters,
  page,
  pageSize,
  totalCount,
  searchParams,
}: StoreServicesTabProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingService, setEditingService] = useState<ServiceFormValues | undefined>()

  function openCreate() {
    setModalMode("create")
    setEditingService(undefined)
    setModalOpen(true)
  }

  function openEdit(service: StoreSettingsServiceRow) {
    setModalMode("edit")
    setEditingService({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      duration: service.duration,
      price: service.price,
      isActive: service.isActive,
      imageUrl: service.imageUrl,
    })
    setModalOpen(true)
  }

  async function handleDelete(serviceId: string) {
    if (!confirm("Delete this service?")) {
      return
    }
    await deleteStoreService(serviceId)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end">
        <ServiceStoreButton type="button" onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" strokeWidth={2.5} />
          New service
        </ServiceStoreButton>
      </div>

      <ManagementInteractiveDataTable
        rows={services}
        columns={columns}
        getRowKey={(service) => service.id}
        onRowClick={openEdit}
        emptyIcon={Wrench}
        emptyMessage="No services yet."
        filteredEmptyMessage="No services match your filters."
        hasFilters={hasFilters}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        searchParams={searchParams}
        itemLabel="services"
        minWidth="760px"
        actionColumn={{
          render: (service) => (
            <ManagementRowActionsMenu
              ariaLabel={`Actions for ${service.name}`}
              actions={[
                { key: "edit", label: "Edit", onSelect: () => openEdit(service) },
                {
                  key: "delete",
                  label: "Delete",
                  destructive: true,
                  onSelect: () => void handleDelete(service.id),
                },
              ]}
            />
          ),
        }}
      />

      <ServiceFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={editingService}
        onOpenChange={setModalOpen}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
