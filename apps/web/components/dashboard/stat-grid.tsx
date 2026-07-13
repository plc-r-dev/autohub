import { CalendarDays, Users, Wallet, Wrench } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { formatPrice } from "@/lib/booking/format";

type StatGridProps = {
  todaysBookings: number;
  todaysRevenue: number;
  inService: number;
  activeCustomers: number;
  bookingsTrendPct?: number | null;
  customersTrendPct?: number | null;
  bookingTrend7?: number[];
  revenueTrend7?: number[];
  bookingsLabel?: string;
  revenueLabel?: string;
};

function formatCompactPrice(amount: number) {
  if (amount >= 1000) {
    return `฿${(amount / 1000).toFixed(1)}k`;
  }
  return formatPrice(amount);
}

function formatKpiCount(value: number) {
  return value === 0 ? "-" : String(value).padStart(2, "0");
}

function formatKpiValue(value: number) {
  return value === 0 ? "-" : value;
}

function formatKpiRevenue(amount: number) {
  return amount === 0 ? "-" : formatCompactPrice(amount);
}

/** The four top-line dashboard metrics with trends and sparklines. */
export function StatGrid({
  todaysBookings,
  todaysRevenue,
  inService,
  activeCustomers,
  bookingsTrendPct,
  customersTrendPct,
  bookingTrend7 = [],
  revenueTrend7 = [],
  bookingsLabel = "Today's bookings",
  revenueLabel = "Revenue today",
}: StatGridProps) {
  const inServiceCapacity = Math.min(Math.max(inService * 12, 8), 100);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        label={bookingsLabel}
        value={formatKpiCount(todaysBookings)}
        icon={CalendarDays}
        accent="emerald"
        trendPct={bookingsTrendPct}
        sparkline={bookingTrend7}
      />
      <DashboardStatCard
        label={revenueLabel}
        value={formatKpiRevenue(todaysRevenue)}
        icon={Wallet}
        accent="green"
        sparkline={revenueTrend7}
      />
      <DashboardStatCard
        label="In service"
        value={formatKpiCount(inService)}
        icon={Wrench}
        accent="sky"
        stableLabel="Stable"
        progressPct={inService === 0 ? 0 : inServiceCapacity}
      />
      <DashboardStatCard
        label="Customers"
        value={formatKpiValue(activeCustomers)}
        icon={Users}
        accent="violet"
        trendPct={customersTrendPct}
        sparkline={bookingTrend7}
      />
    </section>
  );
}
