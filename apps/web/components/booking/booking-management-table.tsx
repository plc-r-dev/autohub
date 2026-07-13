"use client";

import { BookingListPagination } from "@/components/booking/booking-list-pagination";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX } from "lucide-react";
import { BookingStatusUpdateMenu } from "@/components/booking/booking-status-update-menu";
import { AvatarInitials } from "@/components/dashboard/avatar-initials";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  managementTableCardClassName,
  managementTableHeaderClassName,
  managementTableRowClassName,
} from "@/components/listing/management/styles";
import { AppToastViewport, useAppToast } from "@/components/ui/app-toast";
import { ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { updateServiceStoreBookingStatus } from "@/lib/booking/actions";
import { getDashboardBookingActions } from "@/lib/booking/dashboard-status-options";
import {
  bookingStatusLabel,
  formatBookingDate,
  formatBookingTime24,
} from "@/lib/booking/format";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import type { getServiceStoreBookingsPaginated } from "@/lib/booking/queries";

type BookingRow = Awaited<
  ReturnType<typeof getServiceStoreBookingsPaginated>
>["rows"][number];

type BookingManagementTableProps = {
  bookings: BookingRow[];
  singleDayRange: boolean;
  hasFilters: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: Record<string, string | undefined>;
};

function formatCustomerName(booking: BookingRow) {
  return `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
}

function formatVehicleLabel(booking: BookingRow) {
  const vehicle = `${booking.vehicle.brand} ${booking.vehicle.model}`.trim();
  return vehicle || booking.vehicle.licensePlate;
}

function formatServiceLabel(booking: BookingRow) {
  return booking.items[0]?.service.name ?? "Service";
}

/** Operations-focused bookings table with row navigation and status updates. */
export function BookingManagementTable({
  bookings,
  singleDayRange,
  hasFilters,
  page,
  pageSize,
  totalCount,
  searchParams,
}: BookingManagementTableProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useAppToast();
  const [rows, setRows] = useState(bookings);
  const [pendingBookingNumber, setPendingBookingNumber] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setRows(bookings);
  }, [bookings]);

  const handleStatusChange = useCallback(
    async (bookingNumber: string, nextStatus: BookingStatus) => {
      const previousRows = rows;
      setPendingBookingNumber(bookingNumber);
      setRows((current) =>
        current.map((booking) =>
          booking.bookingNumber === bookingNumber
            ? { ...booking, status: nextStatus }
            : booking,
        ),
      );

      const result = await updateServiceStoreBookingStatus(bookingNumber, nextStatus);
      setPendingBookingNumber(null);

      if (result.error) {
        setRows(previousRows);
        showToast(result.error, "error");
        return;
      }

      showToast(result.success ?? "Booking status updated.");
      router.refresh();
    },
    [rows, router, showToast],
  );

  return (
    <>
      <div className={managementTableCardClassName}>
        {rows.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            message={
              hasFilters
                ? "No bookings match your filters."
                : "No bookings for this period yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className={managementTableHeaderClassName}>
                  <th className="px-5 py-3.5 font-semibold">Time</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Vehicle</th>
                  <th className="px-5 py-3.5 font-semibold">Service</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => {
                  const detailHref = `/app/bookings/${booking.bookingNumber}`;
                  const actions = getDashboardBookingActions(booking.status).filter(
                    (action) => action.type !== "view",
                  );

                  return (
                    <tr
                      key={booking.bookingNumber}
                      onClick={() => router.push(detailHref)}
                      className={managementTableRowClassName}
                    >
                      <td className="px-5 py-4 align-middle">
                        {singleDayRange ? (
                          <span className="font-semibold text-foreground">
                            {formatBookingTime24(booking.bookingDate)}
                          </span>
                        ) : (
                          <div>
                            <p className="font-semibold text-foreground">
                              {formatBookingDate(booking.bookingDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatBookingTime24(booking.bookingDate)}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <AvatarInitials
                            firstName={booking.customer.firstName}
                            lastName={booking.customer.lastName}
                            imageUrl={booking.customer.linePictureUrl}
                            size="sm"
                          />
                          <span className="font-medium text-foreground">
                            {formatCustomerName(booking)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {booking.vehicle.licensePlate}
                        </p>
                        <p className="text-xs">{formatVehicleLabel(booking)}</p>
                      </td>
                      <td className="px-5 py-4 align-middle text-muted-foreground">
                        {formatServiceLabel(booking)}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <ServiceStoreStatusBadge
                          label={bookingStatusLabel(booking.status)}
                          status={booking.status}
                        />
                      </td>
                      <td
                        className="px-5 py-4 text-right align-middle"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {actions.length > 0 ? (
                          <BookingStatusUpdateMenu
                            bookingNumber={booking.bookingNumber}
                            status={booking.status}
                            isPending={pendingBookingNumber === booking.bookingNumber}
                            onStatusChange={handleStatusChange}
                            hideViewAction
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 ? (
        <BookingListPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchParams={searchParams}
          itemLabel="bookings"
        />
        ) : null}
      </div>

      <AppToastViewport toast={toast} onDismiss={dismissToast} />
    </>
  );
}
