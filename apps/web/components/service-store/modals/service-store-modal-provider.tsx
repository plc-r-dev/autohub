"use client"

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useSearchParams } from "next/navigation"
import { CustomerDetailModal } from "@/components/service-store/modals/customer-detail-modal"
import { ServiceStoreBookingDetailModal } from "@/components/service-store/modals/service-store-booking-detail-modal"
import { VehicleDetailModal } from "@/components/service-store/modals/vehicle-detail-modal"
import { loadServiceStoreBookingDetail } from "@/lib/booking/service-store-booking-detail-actions"
import type { ServiceStoreBookingDetailData } from "@/lib/booking/service-store-booking-detail-actions"
import {
  loadCustomerDetail,
  type CustomerDetailData,
} from "@/lib/customer/customer-detail-actions"
import {
  loadVehicleDetail,
  type VehicleDetailData,
} from "@/lib/customer/vehicle-detail-actions"

type ServiceStoreModalContextValue = {
  openCustomer: (customerId: string) => void
  openVehicle: (customerId: string, vehicleId: string) => void
  openBooking: (bookingNumber: string) => void
}

const ServiceStoreModalContext = createContext<ServiceStoreModalContextValue | null>(null)

export function useServiceStoreModals() {
  const context = useContext(ServiceStoreModalContext)
  if (!context) {
    throw new Error("useServiceStoreModals must be used within ServiceStoreModalProvider")
  }
  return context
}

export function ServiceStoreModalProvider({ children }: { children: React.ReactNode }) {
  const [customerOpen, setCustomerOpen] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<CustomerDetailData | null>(null)
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null)

  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleError, setVehicleError] = useState<string | null>(null)
  const [vehicleData, setVehicleData] = useState<VehicleDetailData | null>(null)

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<ServiceStoreBookingDetailData | null>(null)

  const openCustomer = useCallback(async (customerId: string) => {
    setActiveCustomerId(customerId)
    setCustomerOpen(true)
    setCustomerLoading(true)
    setCustomerError(null)
    setCustomerData(null)

    try {
      const result = await loadCustomerDetail(customerId)
      if (!result.ok) {
        setCustomerError(result.error)
        return
      }
      setCustomerData(result.data)
    } finally {
      setCustomerLoading(false)
    }
  }, [])

  const openVehicle = useCallback(async (customerId: string, vehicleId: string) => {
    setActiveCustomerId(customerId)
    setVehicleOpen(true)
    setVehicleLoading(true)
    setVehicleError(null)
    setVehicleData(null)

    try {
      const result = await loadVehicleDetail(customerId, vehicleId)
      if (!result.ok) {
        setVehicleError(result.error)
        return
      }
      setVehicleData(result.data)
    } finally {
      setVehicleLoading(false)
    }
  }, [])

  const openBooking = useCallback(async (bookingNumber: string) => {
    setBookingOpen(true)
    setBookingLoading(true)
    setBookingError(null)
    setBookingData(null)

    try {
      const result = await loadServiceStoreBookingDetail(bookingNumber)
      if (!result.ok) {
        setBookingError(result.error)
        return
      }
      setBookingData(result.data)
      setActiveCustomerId(result.data.customer.id)
    } finally {
      setBookingLoading(false)
    }
  }, [])

  const openedFromUrl = useRef(false)

  const value = useMemo(
    () => ({ openCustomer, openVehicle, openBooking }),
    [openCustomer, openVehicle, openBooking],
  )

  return (
    <ServiceStoreModalContext.Provider value={value}>
      <Suspense fallback={null}>
        <ServiceStoreModalUrlSync
          openedFromUrl={openedFromUrl}
          onOpenCustomer={openCustomer}
          onOpenVehicle={openVehicle}
        />
      </Suspense>
      {children}

      <CustomerDetailModal
        open={customerOpen}
        loading={customerLoading}
        error={customerError}
        data={customerData}
        onOpenChange={setCustomerOpen}
        onOpenVehicle={(vehicleId) => {
          if (activeCustomerId) {
            void openVehicle(activeCustomerId, vehicleId)
          }
        }}
        onOpenBooking={(bookingNumber) => {
          void openBooking(bookingNumber)
        }}
      />

      <VehicleDetailModal
        open={vehicleOpen}
        loading={vehicleLoading}
        error={vehicleError}
        data={vehicleData}
        onOpenChange={setVehicleOpen}
        onOpenBooking={(bookingNumber) => {
          void openBooking(bookingNumber)
        }}
      />

      <ServiceStoreBookingDetailModal
        open={bookingOpen}
        loading={bookingLoading}
        error={bookingError}
        data={bookingData}
        onOpenChange={setBookingOpen}
        onOpenCustomer={(customerId) => {
          void openCustomer(customerId)
        }}
      />
    </ServiceStoreModalContext.Provider>
  )
}

function ServiceStoreModalUrlSync({
  openedFromUrl,
  onOpenCustomer,
  onOpenVehicle,
}: {
  openedFromUrl: React.MutableRefObject<boolean>
  onOpenCustomer: (customerId: string) => Promise<void>
  onOpenVehicle: (customerId: string, vehicleId: string) => Promise<void>
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (openedFromUrl.current) {
      return
    }

    const customerId = searchParams.get("customerId")
    const vehicleId = searchParams.get("vehicleId")

    if (!customerId) {
      return
    }

    openedFromUrl.current = true

    void onOpenCustomer(customerId).then(() => {
      if (vehicleId) {
        void onOpenVehicle(customerId, vehicleId)
      }
    })
  }, [searchParams, onOpenCustomer, onOpenVehicle, openedFromUrl])

  return null
}
