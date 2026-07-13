import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";
import { formatBookingTime } from "@/lib/booking/format";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";
import { cn } from "@workspace/ui/lib/utils";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type UpcomingScheduleProps = {
  bookings: Metrics["upcomingBookings"];
  title?: string;
};

function formatVehicleSummary(booking: Metrics["upcomingBookings"][number]) {
  return `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
}

/** Next confirmed/pending bookings as a vertical timeline, soonest first. */
export function UpcomingSchedule({
  bookings,
  title = "Today's schedule",
}: UpcomingScheduleProps) {
  return (
    <Card className={portalCardClassName}>
      <CardHeader>
        <SectionHeader title={title} />
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <EmptyState icon={CalendarClock} message="No upcoming bookings." />
        ) : (
          <ol className="space-y-4">
            {bookings.map((booking, index) => (
              <li key={booking.bookingNumber} className="flex gap-3">
                <span className="flex flex-col items-center pt-1">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      index === 0 ? "bg-[#16A34A]" : "bg-emerald-200",
                    )}
                  />
                  {index < bookings.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  ) : null}
                </span>
                <Link
                  href={`/app/bookings/${booking.bookingNumber}`}
                  className="min-w-0 flex-1 pb-1"
                >
                  <p className="text-xs font-semibold text-[#166534] dark:text-emerald-400">
                    {formatBookingTime(booking.bookingDate)}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatVehicleSummary(booking)}
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
