"use server"

import { requireCustomerIdentity } from "@/lib/auth/require-identity"
import { requireCustomerForUser } from "@/lib/customer/context"
import { getCustomerBooking } from "@/lib/booking/queries"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export type CustomerBookingDetailData = {
  bookingNumber: string
  status: BookingStatus
  bookingDate: string
  confirmedAt: string | null
  startedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  noShowAt: string | null
  branch: {
    name: string
    address: string | null
    serviceStore: {
      name: string
      phone: string | null
    }
  }
  vehicle: {
    licensePlate: string
    brand: string
    model: string
  }
  items: Array<{
    id: string
    unitPrice: string
    service: {
      name: string
      duration: number
    }
  }>
}

export type LoadCustomerBookingDetailResult =
  | { ok: true; booking: CustomerBookingDetailData }
  | { ok: false; error: string }

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

export async function loadCustomerBookingDetail(
  bookingNumber: string,
): Promise<LoadCustomerBookingDetailResult> {
  const { identity } = await requireCustomerIdentity()
  if (!identity.domainUserId) {
    return { ok: false, error: "Customer profile not found." }
  }

  const customer = await requireCustomerForUser(identity.domainUserId)

  if (!customer) {
    return { ok: false, error: "Customer profile not found." }
  }

  const booking = await getCustomerBooking(bookingNumber, customer.id)
  if (!booking) {
    return { ok: false, error: "Booking not found." }
  }

  return {
    ok: true,
    booking: {
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      bookingDate: booking.bookingDate.toISOString(),
      confirmedAt: toIso(booking.confirmedAt),
      startedAt: toIso(booking.startedAt),
      completedAt: toIso(booking.completedAt),
      cancelledAt: toIso(booking.cancelledAt),
      noShowAt: toIso(booking.noShowAt),
      branch: {
        name: booking.branch.name,
        address: booking.branch.address,
        serviceStore: {
          name: booking.branch.serviceStore.name,
          phone: booking.branch.serviceStore.phone,
        },
      },
      vehicle: {
        licensePlate: booking.vehicle.licensePlate,
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
      },
      items: booking.items.map((item) => ({
        id: item.id,
        unitPrice: item.unitPrice.toString(),
        service: {
          name: item.service.name,
          duration: item.service.duration,
        },
      })),
    },
  }
}
