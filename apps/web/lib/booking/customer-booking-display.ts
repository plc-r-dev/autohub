import type { BookingCardData } from "@/components/customer/ui/booking-card"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export const CUSTOMER_UPCOMING_BOOKING_STATUSES = new Set<BookingStatus>([
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
])

export function splitCustomerBookings(bookings: BookingCardData[]) {
  const upcoming = bookings.filter((booking) =>
    CUSTOMER_UPCOMING_BOOKING_STATUSES.has(booking.status as BookingStatus),
  )
  const past = bookings.filter(
    (booking) => !CUSTOMER_UPCOMING_BOOKING_STATUSES.has(booking.status as BookingStatus),
  )

  return { upcoming, past }
}
