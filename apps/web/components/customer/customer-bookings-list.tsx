"use client"

import { BookingCard, type BookingCardData, SectionHeader } from "@/components/customer/ui"
import { splitCustomerBookings } from "@/lib/booking/customer-booking-display"

type CustomerBookingsListProps = {
  bookings: BookingCardData[]
  grouped?: boolean
  className?: string
  onViewDetail?: (bookingNumber: string) => void
}

function BookingCards({
  bookings,
  onViewDetail,
}: {
  bookings: BookingCardData[]
  onViewDetail?: (bookingNumber: string) => void
}) {
  return (
    <div className="grid gap-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.bookingNumber}
          booking={booking}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  )
}

export function CustomerBookingsList({
  bookings,
  grouped = false,
  className,
  onViewDetail,
}: CustomerBookingsListProps) {
  if (bookings.length === 0) {
    return null
  }

  if (!grouped) {
    return (
      <div className={className ?? "mx-auto grid w-full max-w-3xl gap-3"}>
        <BookingCards bookings={bookings} onViewDetail={onViewDetail} />
      </div>
    )
  }

  const { upcoming, past } = splitCustomerBookings(bookings)

  return (
    <div className={className ?? "mx-auto flex w-full max-w-3xl flex-col gap-8"}>
      {upcoming.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Upcoming" />
          <BookingCards bookings={upcoming} onViewDetail={onViewDetail} />
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Past" />
          <BookingCards bookings={past} onViewDetail={onViewDetail} />
        </section>
      ) : null}
    </div>
  )
}
