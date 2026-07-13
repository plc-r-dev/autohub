"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { AvatarInitials } from "@/components/dashboard/avatar-initials"
import {
  DetailModalList,
  DetailModalListItem,
  DetailModalMetric,
  DetailModalMetricGrid,
  DetailModalSection,
  DetailModalTabs,
} from "@/components/service-store/modals/detail-modal-parts"
import { DetailModalShell } from "@/components/service-store/modals/detail-modal-shell"
import { ServiceStoreButton, ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format"
import type { CustomerDetailData } from "@/lib/customer/customer-detail-actions"
import {
  managementTableCardClassName,
  managementTableHeaderClassName,
  managementTableRowClassName,
} from "@/components/listing/management/styles"

type CustomerDetailTab = "overview" | "history"

type CustomerBookingHistoryTableProps = {
  bookings: CustomerDetailData["bookingHistory"]
  onOpenBooking: (bookingNumber: string) => void
  onOpenVehicle: (vehicleId: string) => void
}

function CustomerBookingHistoryTable({
  bookings,
  onOpenBooking,
  onOpenVehicle,
}: CustomerBookingHistoryTableProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>
  }

  return (
    <div className={managementTableCardClassName}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={managementTableHeaderClassName}>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Service</th>
              <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => onOpenBooking(booking.bookingNumber)}
                className={managementTableRowClassName}
              >
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(booking.bookingDate)}
                </td>
                <td className="px-4 py-3 text-foreground">{booking.serviceLabel}</td>
                <td className="px-4 py-3 text-foreground">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenVehicle(booking.vehicleId)
                    }}
                    className="text-left hover:text-[#16A34A] dark:hover:text-foreground"
                  >
                    <span className="block font-medium">{booking.vehiclePlate}</span>
                    <span className="block text-xs text-muted-foreground">
                      {booking.vehicleBrand} {booking.vehicleModel}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <ServiceStoreStatusBadge
                    label={bookingStatusLabel(booking.status)}
                    status={booking.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type CustomerDetailContentProps = {
  data: CustomerDetailData
  onOpenVehicle: (vehicleId: string) => void
  onOpenBooking: (bookingNumber: string) => void
}

export function CustomerDetailHeader({ data }: { data: CustomerDetailData }) {
  const { customer } = data

  return (
    <div className="flex items-center gap-3">
      <AvatarInitials
        firstName={customer.firstName}
        lastName={customer.lastName}
        size="default"
      />
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-foreground">
          {customer.firstName} {customer.lastName}
        </p>
        {customer.phone ? (
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        ) : null}
        {customer.lineDisplayName ? (
          <p className="text-sm text-muted-foreground">LINE: {customer.lineDisplayName}</p>
        ) : null}
      </div>
    </div>
  )
}

export function CustomerDetailContent({
  data,
  onOpenVehicle,
  onOpenBooking,
}: CustomerDetailContentProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("overview")
  const { customer, metrics, bookingHistory } = data

  return (
    <div className="flex flex-col gap-6">
      <DetailModalMetricGrid>
        <DetailModalMetric label="Total visits" value={metrics.totalVisits} />
        <DetailModalMetric
          label="Total spending"
          value={formatPrice(metrics.totalSpending)}
        />
        <DetailModalMetric
          label="Last visit"
          value={metrics.lastVisit ? formatDateTime(metrics.lastVisit) : "—"}
        />
      </DetailModalMetricGrid>

      <DetailModalTabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as CustomerDetailTab)}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "history", label: "History" },
        ]}
      />

      {activeTab === "overview" ? (
        <div className="flex flex-col gap-6">
          <DetailModalSection title="Contact">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-0.5 font-medium text-foreground">{customer.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-0.5 font-medium text-foreground">{customer.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">LINE display name</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {customer.lineDisplayName ?? "—"}
                </dd>
              </div>
            </dl>
          </DetailModalSection>

          <DetailModalSection title="Favorite services">
            {metrics.favoriteServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed services yet.</p>
            ) : (
              <DetailModalList>
                {metrics.favoriteServices.map((service) => (
                  <DetailModalListItem key={service.name}>
                    <span className="text-foreground">{service.name}</span>
                    <span className="font-semibold text-muted-foreground">{service.count}</span>
                  </DetailModalListItem>
                ))}
              </DetailModalList>
            )}
          </DetailModalSection>
        </div>
      ) : (
        <DetailModalSection title="Booking history">
          <CustomerBookingHistoryTable
            bookings={bookingHistory}
            onOpenBooking={onOpenBooking}
            onOpenVehicle={onOpenVehicle}
          />
        </DetailModalSection>
      )}
    </div>
  )
}

type CustomerDetailModalProps = {
  open: boolean
  loading: boolean
  error: string | null
  data: CustomerDetailData | null
  onOpenChange: (open: boolean) => void
  onOpenVehicle: (vehicleId: string) => void
  onOpenBooking: (bookingNumber: string) => void
}

export function CustomerDetailModal({
  open,
  loading,
  error,
  data,
  onOpenChange,
  onOpenVehicle,
  onOpenBooking,
}: CustomerDetailModalProps) {
  return (
    <DetailModalShell
      open={open}
      onOpenChange={onOpenChange}
      header={data ? <CustomerDetailHeader data={data} /> : <p className="font-semibold">Customer</p>}
      footer={
        <ServiceStoreButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </ServiceStoreButton>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading customer...
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : data ? (
        <CustomerDetailContent
          key={data.customer.id}
          data={data}
          onOpenVehicle={onOpenVehicle}
          onOpenBooking={onOpenBooking}
        />
      ) : null}
    </DetailModalShell>
  )
}
