import type { BookingCardData } from "@/components/customer/ui/booking-card"
import type { BookingStatus } from "@/lib/generated/prisma/client"
import { buildSignedStorageUrl } from "@/lib/storage/signed-url"

type CustomerBookingRow = {
  bookingNumber: string
  status: BookingStatus
  bookingDate: Date
  branch: {
    name: string
    serviceStore: {
      id: string
      name: string
      logoKey?: string | null
      coverImageKey?: string | null
      galleryImageKeys?: string[]
    }
  }
  vehicle: {
    licensePlate: string
    brand: string | null
    model: string | null
  }
  items: Array<{ service: { name: string } }>
}

function resolveServiceStoreImageUrl(store: CustomerBookingRow["branch"]["serviceStore"]) {
  const key = store.coverImageKey || store.galleryImageKeys?.[0] || store.logoKey
  if (!key) {
    return null
  }
  return buildSignedStorageUrl(key, 3600)
}

/** Server-only — do not import from client components. */
export function toCustomerBookingCardData(booking: CustomerBookingRow): BookingCardData {
  return {
    bookingNumber: booking.bookingNumber,
    serviceStoreId: booking.branch.serviceStore.id,
    serviceStoreName: booking.branch.serviceStore.name,
    serviceStoreImageUrl: resolveServiceStoreImageUrl(booking.branch.serviceStore),
    branchName: booking.branch.name,
    bookingDate: booking.bookingDate,
    vehiclePlate: booking.vehicle.licensePlate,
    vehicleLabel:
      [booking.vehicle.brand, booking.vehicle.model].filter(Boolean).join(" ") || undefined,
    serviceNames: booking.items.map((item) => item.service.name),
    status: booking.status,
  }
}
