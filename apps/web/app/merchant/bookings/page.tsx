import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import {
  bookingStatusLabel,
  formatDateTime,
} from "@/lib/booking/format";
import { getMerchantBookingsPaginated } from "@/lib/booking/queries";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/client";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    branchId?: string;
    from?: string;
    to?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function MerchantBookingsPage({ searchParams }: PageProps) {
  const { merchant } = await requireApprovedMerchantUser();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const branches = await prisma.branch.findMany({
    where: { merchantId: merchant.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const { totalCount, rows } = await getMerchantBookingsPaginated(merchant.id, {
    q: params.q,
    status: params.status as BookingStatus | undefined,
    branchId: params.branchId,
    from: params.from ? new Date(params.from) : undefined,
    to: params.to ? new Date(params.to) : undefined,
    page,
    pageSize,
    sort,
  });

  return (
    <PageShell
      title="Bookings"
      description="Manage customer bookings for your branches."
      nav={merchantNav}
      backHref="/merchant/dashboard"
    >
      <div className="flex justify-end">
        <Link
          href="/merchant/bookings/new"
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center rounded-4xl px-3 text-sm font-medium"
        >
          Walk-in booking
        </Link>
      </div>

      <ListToolbar
        searchPlaceholder="Search booking number, customer, plate"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map((status) => ({
              value: status,
              label: bookingStatusLabel(status as BookingStatus),
            })),
          },
          {
            key: "branchId",
            label: "Branch",
            options: branches.map((branch) => ({ value: branch.id, label: branch.name })),
          },
        ]}
      />
      <ListTable
        rows={rows}
        getRowKey={(booking) => booking.bookingNumber}
        emptyLabel="No bookings yet."
        hasFilters={Boolean(params.q || params.status || params.branchId)}
        columns={[
          {
            key: "booking",
            header: "Booking",
            render: (booking) => (
              <Link href={`/merchant/bookings/${booking.bookingNumber}`} className="font-medium underline-offset-2 hover:underline">
                {booking.bookingNumber}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (booking) => `${booking.customer.firstName} ${booking.customer.lastName}`,
          },
          { key: "branch", header: "Branch", render: (booking) => booking.branch.name },
          { key: "date", header: "Date", render: (booking) => formatDateTime(booking.bookingDate) },
          {
            key: "vehicle",
            header: "Vehicle",
            render: (booking) => `${booking.vehicle.licensePlate} · ${booking.vehicle.brand} ${booking.vehicle.model}`,
          },
          { key: "status", header: "Status", render: (booking) => bookingStatusLabel(booking.status) },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
