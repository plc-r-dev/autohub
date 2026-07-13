import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { CustomerBookingsFilters } from "@/components/customer/customer-bookings-filters"
import { CustomerBookingsSection } from "@/components/customer/customer-bookings-section"
import { CustomerShell } from "@/components/customer/customer-shell"
import { ButtonLink, EmptyState } from "@/components/customer/ui"
import { requireDomainUser } from "@/lib/auth/domain-user"
import { requireCustomerForUser } from "@/lib/customer/context"
import { toCustomerBookingCardData } from "@/lib/booking/customer-booking-display"
import { getCustomerBookingsPaginated } from "@/lib/booking/queries"
import type { BookingStatus } from "@/lib/generated/prisma/client"
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params"

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    sort?: string
    page?: string
    pageSize?: string
  }>
}

export default async function MyBookingsPage({ searchParams }: PageProps) {
  const { user } = await requireDomainUser()
  const params = await searchParams
  const customer = await requireCustomerForUser(user.id)
  if (!customer) redirect("/browse")

  const { page, pageSize } = parseListPaging({ ...params, pageSize: params.pageSize ?? "20" })
  const sort = parseSortOrder(params.sort)
  const statusFilter = params.status as BookingStatus | undefined
  const { totalCount, rows } = await getCustomerBookingsPaginated(customer.id, {
    q: params.q,
    status: statusFilter,
    page,
    pageSize,
    sort,
  })

  const bookings = rows.map(toCustomerBookingCardData)
  const showGrouped = !statusFilter && !params.q

  return (
    <CustomerShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-8 md:gap-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-[#0F172A] md:text-[36px]">
              My bookings
            </h1>
            <p className="mt-2 text-[16px] text-[#64748B]">
              {totalCount === 0
                ? "Your upcoming and past appointments"
                : `${totalCount} appointment${totalCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <ButtonLink href="/browse" size="md" className="w-full sm:w-auto">
            Book service
          </ButtonLink>
        </div>

        <Suspense fallback={null}>
          <CustomerBookingsFilters />
        </Suspense>

        {bookings.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-7" />}
            title={params.q || params.status ? "No bookings found" : "No bookings yet"}
            description={
              params.q || params.status
                ? "Try a different search or filter."
                : "Book your first service in under 30 seconds."
            }
            action={
              params.q || params.status ? undefined : (
                <ButtonLink href="/browse">Browse services</ButtonLink>
              )
            }
          />
        ) : (
          <CustomerBookingsSection bookings={bookings} grouped={showGrouped} />
        )}
      </div>
    </CustomerShell>
  )
}
