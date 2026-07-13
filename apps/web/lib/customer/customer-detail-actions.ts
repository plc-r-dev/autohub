"use server"

import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { getServiceStoreCustomerDetail } from "@/lib/customer/queries"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export type CustomerDetailData = {
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
    lineDisplayName: string | null
    vehicles: Array<{
      id: string
      licensePlate: string
      brand: string
      model: string
    }>
  }
  metrics: {
    totalVisits: number
    totalSpending: string
    lastVisit: string | null
    favoriteServices: Array<{ name: string; count: number }>
  }
  bookingHistory: Array<{
    id: string
    bookingNumber: string
    bookingDate: string
    status: BookingStatus
    vehicleId: string
    vehiclePlate: string
    vehicleBrand: string
    vehicleModel: string
    serviceLabel: string
  }>
}

export type LoadCustomerDetailResult =
  | { ok: true; data: CustomerDetailData }
  | { ok: false; error: string }

export async function loadCustomerDetail(
  customerId: string,
): Promise<LoadCustomerDetailResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const result = await getServiceStoreCustomerDetail(serviceStore.id, customerId)

  if (!result) {
    return { ok: false, error: "Customer not found." }
  }

  const { customer, metrics } = result

  return {
    ok: true,
    data: {
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        lineDisplayName: customer.lineDisplayName,
        vehicles: customer.vehicles.map((vehicle) => ({
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
        })),
      },
      metrics: {
        totalVisits: metrics.totalVisits,
        totalSpending: metrics.totalSpending.toString(),
        lastVisit: metrics.lastVisit?.toISOString() ?? null,
        favoriteServices: metrics.favoriteServices,
      },
      bookingHistory: customer.bookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate.toISOString(),
        status: booking.status,
        vehicleId: booking.vehicle.id,
        vehiclePlate: booking.vehicle.licensePlate,
        vehicleBrand: booking.vehicle.brand,
        vehicleModel: booking.vehicle.model,
        serviceLabel: booking.items.map((item) => item.service.name).join(", "),
      })),
    },
  }
}
