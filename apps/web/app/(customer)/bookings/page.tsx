import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { BookingCard, type BookingCardData, ButtonLink, EmptyState } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import { getCustomerBookingsPaginated } from "@/lib/booking/queries";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function MyBookingsPage({ searchParams }: PageProps) {
  const { user } = await requireDomainUser();
  const params = await searchParams;
  const customer = await requireCustomerForUser(user.id);
  if (!customer) redirect("/browse");

  const { page, pageSize } = parseListPaging({ ...params, pageSize: params.pageSize ?? "20" });
  const sort = parseSortOrder(params.sort);
  const { rows } = await getCustomerBookingsPaginated(customer.id, {
    q: params.q,
    status: params.status as BookingStatus | undefined,
    page,
    pageSize,
    sort,
  });

  const bookings: BookingCardData[] = rows.map((b) => ({
    bookingNumber: b.bookingNumber,
    serviceStoreName: b.branch.serviceStore.name,
    bookingDate: b.bookingDate,
    vehiclePlate: b.vehicle.licensePlate,
    status: b.status,
  }));

  return (
    <CustomerShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            Bookings
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Your upcoming and past appointments</p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Book your first service in under 30 seconds."
            action={<ButtonLink href="/browse">Book service</ButtonLink>}
          />
        ) : (
          <div className="grid max-w-3xl gap-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.bookingNumber} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
