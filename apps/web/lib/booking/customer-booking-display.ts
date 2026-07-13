import type { BookingCardData } from "@/components/customer/ui/booking-card"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export const CUSTOMER_UPCOMING_BOOKING_STATUSES = new Set<BookingStatus>([
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
])

type CustomerBookingRow = {
  bookingNumber: string
  status: BookingStatus
  bookingDate: Date
  branch: {
    name: string
    serviceStore: { id: string; name: string }
  }
  vehicle: {
    licensePlate: string
    brand: string | null
    model: string | null
  }
  items: Array<{ service: { name: string } }>
}

export function toCustomerBookingCardData(booking: CustomerBookingRow): BookingCardData {
  return {
    bookingNumber: booking.bookingNumber,
    serviceStoreId: booking.branch.serviceStore.id,
    serviceStoreName: booking.branch.serviceStore.name,
    branchName: booking.branch.name,
    bookingDate: booking.bookingDate,
    vehiclePlate: booking.vehicle.licensePlate,
    vehicleLabel:
      [booking.vehicle.brand, booking.vehicle.model].filter(Boolean).join(" ") || undefined,
    serviceNames: booking.items.map((item) => item.service.name),
    status: booking.status,
  }
}

export function splitCustomerBookings(bookings: BookingCardData[]) {
  const upcoming = bookings.filter((booking) =>
    CUSTOMER_UPCOMING_BOOKING_STATUSES.has(booking.status as BookingStatus),
  )
  const past = bookings.filter(
    (booking) => !CUSTOMER_UPCOMING_BOOKING_STATUSES.has(booking.status as BookingStatus),
  )

  return { upcoming, past }
}
