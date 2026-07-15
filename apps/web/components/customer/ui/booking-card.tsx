"use client"

import { BookingStatusBadge } from "@/components/customer/booking-status-badge"
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image"
import { formatBookingDate, formatBookingTime } from "@/lib/booking/format"
import { Calendar, Car, Clock, MoreVertical, Wrench } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export type BookingCardData = {
  bookingNumber: string
  serviceStoreId: string
  serviceStoreName: string
  serviceStoreImageUrl?: string | null
  branchName?: string
  bookingDate: Date | string
  vehiclePlate: string
  vehicleLabel?: string
  serviceNames: string[]
  status: string
}

const UPCOMING_STATUSES = new Set(["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"])

function formatServiceSummary(names: string[]) {
  if (names.length === 0) {
    return "Service booking"
  }
  if (names.length === 1) {
    return names[0]!
  }
  return `${names[0]} +${names.length - 1} more`
}

type BookingCardProps = {
  booking: BookingCardData
  onViewDetail?: (bookingNumber: string) => void
}

export function BookingCard({ booking, onViewDetail }: BookingCardProps) {
  const isUpcoming = UPCOMING_STATUSES.has(booking.status)
  const serviceSummary = formatServiceSummary(booking.serviceNames)

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border bg-white transition-all duration-200",
        isUpcoming
          ? "border-[#bbf7d0] shadow-[0_1px_3px_rgba(22,163,74,0.08)]"
          : "border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <ServiceShopImage
          serviceStoreId={booking.serviceStoreId}
          serviceStoreName={booking.serviceStoreName}
          imageUrl={booking.serviceStoreImageUrl}
          className="size-[72px] shrink-0 rounded-2xl sm:size-20"
          sizes="80px"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-center sm:text-left">
              <p className="truncate text-[17px] font-semibold tracking-tight text-[#0F172A] sm:text-[18px]">
                {booking.serviceStoreName}
              </p>
              {booking.branchName ? (
                <p className="mt-0.5 truncate text-[13px] text-[#64748B]">{booking.branchName}</p>
              ) : null}
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#0F172A]">
              <Calendar className="size-3.5 text-[#16A34A]" />
              {formatBookingDate(booking.bookingDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#0F172A]">
              <Clock className="size-3.5 text-[#16A34A]" />
              {formatBookingTime(booking.bookingDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] bg-[#FAFBFC] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-[#64748B]">
            <Car className="size-3.5 shrink-0 text-[#94A3B8]" />
            <span className="truncate font-medium text-[#0F172A]">
              {booking.vehiclePlate}
              {booking.vehicleLabel ? (
                <span className="font-normal text-[#64748B]"> · {booking.vehicleLabel}</span>
              ) : null}
            </span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-[#64748B]">
            <Wrench className="size-3.5 shrink-0 text-[#94A3B8]" />
            <span className="truncate">{serviceSummary}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetail?.(booking.bookingNumber)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]"
          aria-label="Booking actions"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>
    </article>
  )
}
