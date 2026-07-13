import { CalendarPlus, Receipt, Wallet, Wrench } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatPrice } from "@/lib/booking/format";

type StatGridProps = {
  todaysBookings: number;
  todaysRevenue: number;
  inService: number;
  outstandingBilling: number;
};

/** The four top-line dashboard metrics, in a responsive 1/2/4-column grid. */
export function StatGrid({ todaysBookings, todaysRevenue, inService, outstandingBilling }: StatGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={CalendarPlus}
        label="Today's bookings"
        value={todaysBookings}
        hint="No bookings yet today"
      />
      <StatCard
        icon={Wallet}
        label="Revenue today"
        value={formatPrice(todaysRevenue)}
        hint="Updated in real time"
      />
      <StatCard
        icon={Wrench}
        label="In service"
        value={inService}
        hint="Vehicles currently in service"
      />
      <StatCard
        icon={Receipt}
        label="Outstanding billing"
        value={formatPrice(outstandingBilling)}
        hint="Pending payment"
      />
    </section>
  );
}
