import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ListDateFilter } from "@/components/service-store/list-date-filter";
import { ServiceStoreButtonLink, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { bookingStatusLabel, formatDateTime } from "@/lib/booking/format";
import { getServiceStoreBookingsPaginated } from "@/lib/booking/queries";
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

export default async function ServiceStoreBookingsPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const branches = await prisma.branch.findMany({
    where: { serviceStoreId: serviceStore.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const { totalCount, rows } = await getServiceStoreBookingsPaginated(serviceStore.id, {
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
      nav={serviceStoreNav}
      backHref="/service-store/dashboard"
      actions={<ServiceStoreButtonLink href="/service-store/bookings/new">Walk-in booking</ServiceStoreButtonLink>}
    >
      <ListToolbar
        searchPlaceholder="Search booking number, customer, plate"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map(
              (status) => ({
                value: status,
                label: bookingStatusLabel(status as BookingStatus),
              }),
            ),
          },
          {
            key: "branchId",
            label: "Branch",
            options: branches.map((branch) => ({ value: branch.id, label: branch.name })),
          },
        ]}
      />
      <div className="grid gap-3 rounded-2xl border border-[#dce5ee] bg-white p-4 sm:grid-cols-2">
        <ListDateFilter />
      </div>
      <ListTable
        rows={rows}
        getRowKey={(booking) => booking.bookingNumber}
        emptyLabel="No bookings yet."
        hasFilters={Boolean(params.q || params.status || params.branchId || params.from || params.to)}
        columns={[
          {
            key: "booking",
            header: "Booking",
            render: (booking) => (
              <Link
                href={`/service-store/bookings/${booking.bookingNumber}`}
                className="font-semibold text-[#15202b] underline-offset-2 hover:underline"
              >
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
            render: (booking) =>
              `${booking.vehicle.licensePlate} · ${booking.vehicle.brand} ${booking.vehicle.model}`,
          },
          {
            key: "status",
            header: "Status",
            render: (booking) => (
              <ServiceStoreStatusBadge
                label={bookingStatusLabel(booking.status)}
                status={booking.status}
              />
            ),
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
