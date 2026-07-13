"use client"

import { Loader2, Navigation, Phone } from "lucide-react"
import { BookingSuccessPanel } from "@/components/booking/booking-success-panel"
import { BookingStatusBadge } from "@/components/customer/booking-status-badge"
import { Card, Sheet, Timeline } from "@/components/customer/ui"
import { formatBookingDate, formatBookingTime, formatPrice } from "@/lib/booking/format"
import type { CustomerBookingDetailData } from "@/lib/booking/customer-booking-actions"

type CustomerBookingDetailSheetProps = {
  open: boolean
  loading: boolean
  error: string | null
  booking: CustomerBookingDetailData | null
  onClose: () => void
}

export function CustomerBookingDetailSheet({
  open,
  loading,
  error,
  booking,
  onClose,
}: CustomerBookingDetailSheetProps) {
  const showSuccess =
    booking?.status === "PENDING" || booking?.status === "CONFIRMED"
  const totalPrice =
    booking?.items.reduce((sum, item) => sum + Number(item.unitPrice), 0) ?? 0
  const phone = booking?.branch.serviceStore.phone
  const mapsQuery = booking?.branch.address ?? booking?.branch.serviceStore.name
  const canCancelHint =
    booking?.status === "PENDING" || booking?.status === "CONFIRMED"

  return (
    <Sheet open={open} onClose={onClose} title="Booking details">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#64748B]">
          <Loader2 className="size-4 animate-spin" />
          Loading booking...
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-600">{error}</p>
      ) : booking && showSuccess ? (
        <BookingSuccessPanel
          bookingNumber={booking.bookingNumber}
          bookingStatus={booking.status}
          serviceStoreName={booking.branch.serviceStore.name}
          branchName={booking.branch.name}
          bookingDate={booking.bookingDate}
          vehicle={booking.vehicle}
          services={booking.items.map((item) => ({
            name: item.service.name,
            duration: item.service.duration,
            price: Number(item.unitPrice),
          }))}
          totalPrice={totalPrice}
        />
      ) : booking ? (
        <div className="flex flex-col gap-5 pb-2">
          <div className="text-center">
            <p className="text-[14px] text-[#94A3B8]">{booking.bookingNumber}</p>
            <div className="mt-3 flex justify-center">
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>

          <Card>
            <div className="text-center">
              <p className="text-[18px] font-semibold text-[#0F172A]">
                {booking.branch.serviceStore.name}
              </p>
              <p className="mt-1 text-[14px] text-[#64748B]">{booking.branch.name}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                  Date
                </p>
                <p className="mt-1 font-medium">{formatBookingDate(booking.bookingDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                  Time
                </p>
                <p className="mt-1 font-medium">{formatBookingTime(booking.bookingDate)}</p>
              </div>
            </div>
          </Card>

          <Timeline
            status={booking.status}
            confirmedAt={booking.confirmedAt}
            startedAt={booking.startedAt}
            completedAt={booking.completedAt}
            cancelledAt={booking.cancelledAt}
            noShowAt={booking.noShowAt}
          />

          <Card>
            <p className="text-center text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
              Vehicle
            </p>
            <p className="mt-2 text-center text-[22px] font-semibold">
              {booking.vehicle.licensePlate}
            </p>
            <p className="mt-1 text-center text-[14px] text-[#64748B]">
              {booking.vehicle.brand} {booking.vehicle.model}
            </p>
          </Card>

          <Card>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
              Services
            </p>
            <ul className="mt-4 space-y-4">
              {booking.items.map((item) => (
                <li key={item.id} className="flex justify-between text-[15px]">
                  <span>
                    {item.service.name}
                    <span className="block text-[13px] text-[#64748B]">
                      {item.service.duration} min
                    </span>
                  </span>
                  <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between border-t border-[#F1F5F9] pt-4 text-[17px] font-semibold">
              <span>Total</span>
              <span className="text-[#16A34A]">{formatPrice(totalPrice)}</span>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[20px] bg-[#16A34A] text-[15px] font-semibold text-white"
              >
                <Phone className="size-4" />
                Call service shop
              </a>
            ) : null}
            {mapsQuery ? (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[20px] border border-[#E2E8F0] bg-white text-[15px] font-semibold text-[#0F172A]"
              >
                <Navigation className="size-4" />
                Navigate
              </a>
            ) : null}
          </div>

          {canCancelHint ? (
            <p className="text-center text-[14px] text-[#64748B]">
              Need to cancel? Contact the service shop directly.
            </p>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}
