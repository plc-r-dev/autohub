"use server"

import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { getServiceStoreBooking } from "@/lib/booking/queries"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export type ServiceStoreBookingDetailData = {
  bookingNumber: string
  status: BookingStatus
  bookingDate: string
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    isWalkIn: boolean
  }
  branch: {
    name: string
    address: string | null
  }
  vehicle: {
    licensePlate: string
    brand: string
    model: string
  }
  items: Array<{
    id: string
    serviceName: string
    duration: number
    unitPrice: string
    quantity: number
  }>
  totalPrice: string
}

export type LoadServiceStoreBookingDetailResult =
  | { ok: true; data: ServiceStoreBookingDetailData }
  | { ok: false; error: string }

export async function loadServiceStoreBookingDetail(
  bookingNumber: string,
): Promise<LoadServiceStoreBookingDetailResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const booking = await getServiceStoreBooking(bookingNumber, serviceStore.id)

  if (!booking) {
    return { ok: false, error: "Booking not found." }
  }

  const totalPrice = booking.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  )

  return {
    ok: true,
    data: {
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      bookingDate: booking.bookingDate.toISOString(),
      customer: {
        id: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        phone: booking.customer.phone,
        isWalkIn: booking.customer.isWalkIn,
      },
      branch: {
        name: booking.branch.name,
        address: booking.branch.address,
      },
      vehicle: {
        licensePlate: booking.vehicle.licensePlate,
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
      },
      items: booking.items.map((item) => ({
        id: item.id,
        serviceName: item.service.name,
        duration: item.service.duration,
        unitPrice: item.unitPrice.toString(),
        quantity: item.quantity,
      })),
      totalPrice: totalPrice.toString(),
    },
  }
}
