"use client"

import { Loader2 } from "lucide-react"
import {
  DetailModalList,
  DetailModalListItem,
  DetailModalMetric,
  DetailModalMetricGrid,
  DetailModalSection,
} from "@/components/service-store/modals/detail-modal-parts"
import { DetailModalShell } from "@/components/service-store/modals/detail-modal-shell"
import { ServiceStoreButton, ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format"
import type { VehicleDetailData } from "@/lib/customer/vehicle-detail-actions"

type VehicleDetailModalProps = {
  open: boolean
  loading: boolean
  error: string | null
  data: VehicleDetailData | null
  onOpenChange: (open: boolean) => void
  onOpenBooking: (bookingNumber: string) => void
}

export function VehicleDetailModal({
  open,
  loading,
  error,
  data,
  onOpenChange,
  onOpenBooking,
}: VehicleDetailModalProps) {
  return (
    <DetailModalShell
      open={open}
      onOpenChange={onOpenChange}
      header={
        data ? (
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground">{data.vehicle.licensePlate}</p>
            <p className="text-sm text-muted-foreground">
              {data.vehicle.brand} {data.vehicle.model}
            </p>
          </div>
        ) : (
          <p className="font-semibold">Vehicle</p>
        )
      }
      footer={
        <ServiceStoreButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </ServiceStoreButton>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading vehicle...
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : data ? (
        <div className="flex flex-col gap-6">
          <DetailModalMetricGrid>
            <DetailModalMetric
              label="Total spending"
              value={formatPrice(data.metrics.totalSpending)}
            />
            <DetailModalMetric
              label="Last wash"
              value={
                data.metrics.lastWashDate ? formatDateTime(data.metrics.lastWashDate) : "—"
              }
            />
            <DetailModalMetric
              label="Province"
              value={data.vehicle.province ?? "—"}
            />
          </DetailModalMetricGrid>

          <DetailModalSection title="Vehicle details">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Color</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.vehicle.color ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Year</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.vehicle.year ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.vehicle.notes ?? "—"}</dd>
              </div>
            </dl>
          </DetailModalSection>

          <DetailModalSection title="Services received">
            {data.metrics.servicesReceived.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed services yet.</p>
            ) : (
              <DetailModalList>
                {data.metrics.servicesReceived.map((service) => (
                  <DetailModalListItem key={service.name}>
                    <span className="text-foreground">{service.name}</span>
                    <span className="font-semibold text-muted-foreground">{service.count}</span>
                  </DetailModalListItem>
                ))}
              </DetailModalList>
            )}
          </DetailModalSection>

          <DetailModalSection title="Booking history">
            {data.bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings for this vehicle.</p>
            ) : (
              <DetailModalList>
                {data.bookings.map((booking) => (
                  <DetailModalListItem
                    key={booking.id}
                    onClick={() => onOpenBooking(booking.bookingNumber)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{booking.bookingNumber}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(booking.bookingDate)} · {booking.serviceLabel}
                      </p>
                    </div>
                    <ServiceStoreStatusBadge
                      label={bookingStatusLabel(booking.status)}
                      status={booking.status}
                    />
                  </DetailModalListItem>
                ))}
              </DetailModalList>
            )}
          </DetailModalSection>
        </div>
      ) : null}
    </DetailModalShell>
  )
}
