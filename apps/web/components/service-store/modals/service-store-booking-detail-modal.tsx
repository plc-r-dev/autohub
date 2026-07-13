"use client"

import { Loader2 } from "lucide-react"
import { DetailModalSection } from "@/components/service-store/modals/detail-modal-parts"
import { DetailModalShell } from "@/components/service-store/modals/detail-modal-shell"
import { ServiceStoreButton, ServiceStoreStatusBadge } from "@/components/service-store/ui"
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format"
import type { ServiceStoreBookingDetailData } from "@/lib/booking/service-store-booking-detail-actions"

type ServiceStoreBookingDetailModalProps = {
  open: boolean
  loading: boolean
  error: string | null
  data: ServiceStoreBookingDetailData | null
  onOpenChange: (open: boolean) => void
  onOpenCustomer: (customerId: string) => void
}

export function ServiceStoreBookingDetailModal({
  open,
  loading,
  error,
  data,
  onOpenChange,
  onOpenCustomer,
}: ServiceStoreBookingDetailModalProps) {
  return (
    <DetailModalShell
      open={open}
      onOpenChange={onOpenChange}
      header={
        data ? (
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground">{data.bookingNumber}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(data.bookingDate)}</p>
          </div>
        ) : (
          <p className="font-semibold">Booking</p>
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
          Loading booking...
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : data ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <ServiceStoreStatusBadge
              label={bookingStatusLabel(data.status)}
              status={data.status}
            />
          </div>

          <DetailModalSection title="Customer">
            <button
              type="button"
              onClick={() => onOpenCustomer(data.customer.id)}
              className="text-left text-sm font-medium text-foreground hover:text-[#16A34A] dark:hover:text-foreground"
            >
              {data.customer.firstName} {data.customer.lastName}
              {data.customer.isWalkIn ? " (walk-in)" : ""}
            </button>
            {data.customer.phone ? (
              <p className="mt-1 text-sm text-muted-foreground">{data.customer.phone}</p>
            ) : null}
          </DetailModalSection>

          <DetailModalSection title="Branch">
            <p className="text-sm font-medium text-foreground">{data.branch.name}</p>
            {data.branch.address ? (
              <p className="mt-1 text-sm text-muted-foreground">{data.branch.address}</p>
            ) : null}
          </DetailModalSection>

          <DetailModalSection title="Vehicle">
            <p className="text-sm font-medium text-foreground">
              {data.vehicle.licensePlate} · {data.vehicle.brand} {data.vehicle.model}
            </p>
          </DetailModalSection>

          <DetailModalSection title="Services">
            <ul className="space-y-3 text-sm">
              {data.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-medium text-foreground">{item.serviceName}</span>
                    <span className="mt-0.5 block text-muted-foreground">{item.duration} min</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPrice(item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="text-[#16A34A]">{formatPrice(data.totalPrice)}</span>
            </div>
          </DetailModalSection>
        </div>
      ) : null}
    </DetailModalShell>
  )
}
