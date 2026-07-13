"use server"

import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { getServiceStoreVehicleDetail } from "@/lib/customer/queries"
import type { BookingStatus } from "@/lib/generated/prisma/client"

export type VehicleDetailData = {
  customerId: string
  vehicle: {
    id: string
    licensePlate: string
    brand: string
    model: string
    province: string | null
    color: string | null
    year: number | null
    notes: string | null
  }
  metrics: {
    totalSpending: string
    lastWashDate: string | null
    servicesReceived: Array<{ name: string; count: number }>
  }
  bookings: Array<{
    id: string
    bookingNumber: string
    bookingDate: string
    status: BookingStatus
    serviceLabel: string
  }>
}

export type LoadVehicleDetailResult =
  | { ok: true; data: VehicleDetailData }
  | { ok: false; error: string }

export async function loadVehicleDetail(
  customerId: string,
  vehicleId: string,
): Promise<LoadVehicleDetailResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const result = await getServiceStoreVehicleDetail(serviceStore.id, customerId, vehicleId)

  if (!result) {
    return { ok: false, error: "Vehicle not found." }
  }

  const { vehicle, metrics } = result

  return {
    ok: true,
    data: {
      customerId,
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        province: vehicle.province,
        color: vehicle.color,
        year: vehicle.year,
        notes: vehicle.notes,
      },
      metrics: {
        totalSpending: metrics.totalSpending.toString(),
        lastWashDate: metrics.lastWashDate?.toISOString() ?? null,
        servicesReceived: metrics.servicesReceived,
      },
      bookings: vehicle.bookings.slice(0, 10).map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate.toISOString(),
        status: booking.status,
        serviceLabel: booking.items.map((item) => item.service.name).join(", "),
      })),
    },
  }
}
