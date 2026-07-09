import Link from "next/link";
import { redirect } from "next/navigation";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import {
  getMerchantAccessState,
  isMerchantUser,
} from "@/lib/merchant/access";
import {
  bookingStatusLabel,
  formatDateTime,
} from "@/lib/booking/format";
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
  const merchantAccess = await getMerchantAccessState(user.id);

  if (isMerchantUser(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    redirect("/onboarding/customer");
  }

  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const { totalCount, rows } = await getCustomerBookingsPaginated(customer.id, {
    q: params.q,
    status: params.status as BookingStatus | undefined,
    page,
    pageSize,
    sort,
  });

  return (
    <PageShell
      title="My bookings"
      description="View your service appointments."
      nav={customerNav}
      backHref="/dashboard"
    >
      <ListToolbar
        searchPlaceholder="Search booking number, merchant, branch, plate"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map((status) => ({
              value: status,
              label: bookingStatusLabel(status as BookingStatus),
            })),
          },
        ]}
      />
      <ListTable
        rows={rows}
        getRowKey={(booking) => booking.bookingNumber}
        emptyLabel="No bookings yet."
        hasFilters={Boolean(params.q || params.status)}
        columns={[
          {
            key: "booking",
            header: "Booking",
            render: (booking) => (
              <Link href={`/bookings/${booking.bookingNumber}`} className="font-medium underline-offset-2 hover:underline">
                {booking.bookingNumber}
              </Link>
            ),
          },
          { key: "merchant", header: "Merchant", render: (booking) => booking.branch.merchant.name },
          { key: "branch", header: "Branch", render: (booking) => booking.branch.name },
          { key: "date", header: "Date", render: (booking) => formatDateTime(booking.bookingDate) },
          { key: "vehicle", header: "Vehicle", render: (booking) => booking.vehicle.licensePlate },
          { key: "status", header: "Status", render: (booking) => bookingStatusLabel(booking.status) },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
