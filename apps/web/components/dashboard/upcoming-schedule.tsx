import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { formatDateTime } from "@/lib/booking/format";
import { cn } from "@workspace/ui/lib/utils";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type UpcomingScheduleProps = {
  bookings: Metrics["upcomingBookings"];
};

/** Next confirmed/pending bookings as a vertical timeline, soonest first. */
export function UpcomingSchedule({ bookings }: UpcomingScheduleProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <SectionHeader title="Upcoming schedule" />
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <EmptyState icon={CalendarClock} message="No upcoming bookings." />
        ) : (
          <ol className="max-h-96 space-y-4 overflow-y-auto">
            {bookings.map((booking, index) => (
              <li key={booking.bookingNumber} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span
                    className={cn("size-2.5 rounded-full", index === 0 ? "bg-primary" : "bg-border")}
                  />
                  {index < bookings.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                </span>
                <Link href={`/app/bookings/${booking.bookingNumber}`} className="min-w-0 flex-1 pb-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {formatDateTime(booking.bookingDate)}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{booking.branch.name}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
