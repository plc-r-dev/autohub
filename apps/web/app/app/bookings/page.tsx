import { Suspense } from "react";
import { BookingListFilters } from "@/components/booking/booking-list-filters";
import { BookingManagementTable } from "@/components/booking/booking-management-table";
import { BookingsPageActions } from "@/components/booking/bookings-page-actions";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import {
  isSingleDayBookingRange,
  resolveBookingListDateRange,
} from "@/lib/booking/booking-list-date";
import { getServiceStoreBookingsPaginated } from "@/lib/booking/queries";
import { parseListPaging } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/client";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    branchId?: string;
    range?: string;
    from?: string;
    to?: string;
    page?: string;
    pageSize?: string;
    newBooking?: string;
  }>;
};

export default async function ServiceStoreBookingsPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const dateRange = resolveBookingListDateRange(params);

  const [branches] = await Promise.all([
    prisma.branch.findMany({
      where: { serviceStoreId: serviceStore.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const singleDayRange =
    dateRange.from !== null &&
    dateRange.to !== null &&
    isSingleDayBookingRange(dateRange.from, dateRange.to);

  const { totalCount, rows } = await getServiceStoreBookingsPaginated(serviceStore.id, {
    q: params.q,
    status: params.status as BookingStatus | undefined,
    branchId: branches.length > 1 ? params.branchId : undefined,
    from: dateRange.from ?? undefined,
    to: dateRange.to ?? undefined,
    page,
    pageSize,
    sort: singleDayRange || dateRange.preset === "upcoming" ? "asc" : "desc",
  });

  const hasFilters = Boolean(
    params.q ||
      params.status ||
      (branches.length > 1 && params.branchId) ||
      dateRange.preset !== "all" ||
      params.from ||
      params.to,
  );

  return (
    <PageShell
      title="Bookings"
      nav={serviceStoreNav}
      actions={
        <Suspense fallback={null}>
          <BookingsPageActions />
        </Suspense>
      }
    >
      <div className="space-y-5">
        <Suspense fallback={null}>
          <BookingListFilters
            showBranchFilter={branches.length > 1}
            branches={branches}
          />
        </Suspense>

        <BookingManagementTable
          bookings={rows}
          singleDayRange={singleDayRange}
          hasFilters={hasFilters}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchParams={params}
        />
      </div>
    </PageShell>
  );
}
