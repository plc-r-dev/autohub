"use client"

import { Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { AvatarInitials } from "@/components/dashboard/avatar-initials"
import { EmptyState } from "@/components/dashboard/empty-state"
import { SectionHeader } from "@/components/dashboard/section-header"
import { useServiceStoreModals } from "@/components/service-store/modals"
import { formatDateTime } from "@/lib/booking/format"

type RecentCustomer = {
  customerId: string
  firstName: string
  lastName: string
  linePictureUrl?: string | null
  lastBookingDate: Date | string
}

type RecentCustomersProps = {
  customers: RecentCustomer[]
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  const { openCustomer } = useServiceStoreModals()

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <SectionHeader title="Recent customers" />
      </CardHeader>
      <CardContent className="flex min-h-80 flex-col">
        {customers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={Users} message="No recent customers." />
          </div>
        ) : (
          <ul className="max-h-96 space-y-1.5 overflow-y-auto">
            {customers.map((customer) => (
              <li key={customer.customerId}>
                <button
                  type="button"
                  onClick={() => openCustomer(customer.customerId)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg px-1.5 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <AvatarInitials
                      firstName={customer.firstName}
                      lastName={customer.lastName}
                      imageUrl={customer.linePictureUrl}
                      size="sm"
                    />
                    <span className="font-semibold text-foreground">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(customer.lastBookingDate)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
