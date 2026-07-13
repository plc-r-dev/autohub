"use client"

import { useCallback, useState } from "react"
import { CustomerBookingDetailSheet } from "@/components/customer/customer-booking-detail-sheet"
import { CustomerBookingsList } from "@/components/customer/customer-bookings-list"
import type { BookingCardData } from "@/components/customer/ui"
import {
  loadCustomerBookingDetail,
  type CustomerBookingDetailData,
} from "@/lib/booking/customer-booking-actions"

type CustomerBookingsSectionProps = {
  bookings: BookingCardData[]
  grouped?: boolean
}

export function CustomerBookingsSection({
  bookings,
  grouped = false,
}: CustomerBookingsSectionProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<CustomerBookingDetailData | null>(null)

  const handleClose = useCallback(() => {
    setOpen(false)
    setError(null)
    setBooking(null)
  }, [])

  const handleViewDetail = useCallback(async (bookingNumber: string) => {
    setOpen(true)
    setLoading(true)
    setError(null)
    setBooking(null)

    try {
      const result = await loadCustomerBookingDetail(bookingNumber)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setBooking(result.booking)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <>
      <CustomerBookingsList
        bookings={bookings}
        grouped={grouped}
        onViewDetail={handleViewDetail}
      />
      <CustomerBookingDetailSheet
        open={open}
        loading={loading}
        error={error}
        booking={booking}
        onClose={handleClose}
      />
    </>
  )
}
