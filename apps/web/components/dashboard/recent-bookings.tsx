import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { AvatarInitials } from "@/components/dashboard/avatar-initials";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { bookingStatusLabel, formatDateTime } from "@/lib/booking/format";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type RecentBookingsProps = {
  bookings: Metrics["recentBookings"];
};

/** Most recent bookings across all branches, newest first -- scrolls once the list grows past a few rows. */
export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <SectionHeader
          title="Recent bookings"
          action={
            <Link href="/app/bookings" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          }
        />
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <EmptyState icon={CalendarX} message="No recent bookings." />
        ) : (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {bookings.map((booking) => (
              <Link
                key={booking.bookingNumber}
                href={`/app/bookings/${booking.bookingNumber}`}
                className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-muted"
              >
                <AvatarInitials firstName={booking.customer.firstName} lastName={booking.customer.lastName} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </span>
                    <ServiceStoreStatusBadge label={bookingStatusLabel(booking.status)} status={booking.status} />
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {booking.branch.name} · {formatDateTime(booking.bookingDate)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
