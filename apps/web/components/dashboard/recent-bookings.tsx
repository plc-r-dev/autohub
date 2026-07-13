"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarX } from "lucide-react";
import { BookingStatusUpdateMenu } from "@/components/booking/booking-status-update-menu";
import { CustomerDetailLink } from "@/components/customers/customer-detail-link";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { AvatarInitials } from "@/components/dashboard/avatar-initials";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { AppToastViewport, useAppToast } from "@/components/ui/app-toast";
import { useServiceStoreModals } from "@/components/service-store/modals";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";
import { ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { serviceStoreSelectClassName } from "@/components/service-store/ui/form-theme";
import { updateServiceStoreBookingStatus } from "@/lib/booking/actions";
import { bookingStatusLabel, BOOKING_STATUS_OPTIONS } from "@/lib/booking/format";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;
type DashboardBooking = Metrics["recentBookings"][number];

type RecentBookingsProps = {
  bookings: Metrics["recentBookings"];
  onBookingUpdated?: () => Promise<void> | void;
};

const STATUS_FILTER_OPTIONS: Array<{ value: BookingStatus | "ALL"; label: string }> = [
  ...BOOKING_STATUS_OPTIONS,
  { value: "ALL", label: "All statuses" },
];

const DEFAULT_STATUS: BookingStatus = "PENDING";

function formatVehicleLabel(booking: DashboardBooking) {
  const vehicle = `${booking.vehicle.brand} ${booking.vehicle.model}`.trim();
  return vehicle || booking.vehicle.licensePlate;
}

function formatServiceLabel(booking: DashboardBooking) {
  return booking.items[0]?.service.name ?? "Service";
}

function formatCustomerName(booking: DashboardBooking) {
  return `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
}

/** Recent bookings table with status filter and inline status updates. */
export function RecentBookings({ bookings, onBookingUpdated }: RecentBookingsProps) {
  const router = useRouter();
  const { openBooking } = useServiceStoreModals();
  const { toast, showToast, dismissToast } = useAppToast();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(DEFAULT_STATUS);
  const [rows, setRows] = useState(bookings);
  const [pendingBookingNumber, setPendingBookingNumber] = useState<string | null>(null);

  useEffect(() => {
    setRows(bookings);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const nextRows =
      statusFilter === "ALL"
        ? rows
        : rows.filter((booking) => booking.status === statusFilter);
    return nextRows.slice(0, 6);
  }, [rows, statusFilter]);

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
      await onBookingUpdated?.();
      router.refresh();
    },
    [rows, router, showToast, onBookingUpdated],
  );

  const emptyMessage =
    statusFilter === "ALL"
      ? "No recent bookings."
      : `No ${bookingStatusLabel(statusFilter).toLowerCase()} bookings.`;

  return (
    <>
      <Card className={portalCardClassName}>
        <CardHeader>
          <SectionHeader
            title="Recent bookings"
            action={
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as BookingStatus | "ALL")
                    }
                    className={`${serviceStoreSelectClassName} h-9 min-w-[9.5rem] py-0 text-sm`}
                    aria-label="Filter by status"
                  >
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Link
                  href={
                    statusFilter === "ALL"
                      ? "/app/bookings"
                      : `/app/bookings?status=${statusFilter}`
                  }
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            }
          />
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <EmptyState icon={CalendarX} message={emptyMessage} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 font-medium">Vehicle</th>
                    <th className="px-3 py-2 font-medium">Service type</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.bookingNumber}
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarInitials
                            firstName={booking.customer.firstName}
                            lastName={booking.customer.lastName}
                            imageUrl={booking.customer.linePictureUrl}
                            size="sm"
                          />
                          <CustomerDetailLink
                            customerId={booking.customer.id}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {formatCustomerName(booking)}
                          </CustomerDetailLink>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openBooking(booking.bookingNumber)}
                          className="text-left text-muted-foreground hover:text-primary"
                        >
                          {formatVehicleLabel(booking)}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openBooking(booking.bookingNumber)}
                          className="text-left text-muted-foreground hover:text-primary"
                        >
                          {formatServiceLabel(booking)}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <ServiceStoreStatusBadge
                          label={bookingStatusLabel(booking.status)}
                          status={booking.status}
                        />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <BookingStatusUpdateMenu
                          bookingNumber={booking.bookingNumber}
                          status={booking.status}
                          isPending={pendingBookingNumber === booking.bookingNumber}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AppToastViewport toast={toast} onDismiss={dismissToast} />
    </>
  );
}
