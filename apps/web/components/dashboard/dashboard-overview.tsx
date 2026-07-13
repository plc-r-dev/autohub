"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LiveActivity,
  QuickActions,
  RecentBookings,
  RecentCustomers,
  RevenueTrendChart,
  StatGrid,
  TopServices,
  UpcomingSchedule,
} from "@/components/dashboard";
import { refreshDashboardMetrics } from "@/lib/reporting/dashboard-actions";
import {
  formatDashboardDateKey,
  getDashboardKpiLabels,
  parseDashboardDateKey,
} from "@/lib/reporting/dashboard-date";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type DashboardMetrics = NonNullable<
  Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>
>;

type DashboardOverviewProps = {
  initialMetrics: DashboardMetrics;
};

export function DashboardOverview({ initialMetrics }: DashboardOverviewProps) {
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState(initialMetrics);
  const selectedDateKey =
    searchParams.get("date") ?? formatDashboardDateKey(new Date());

  useEffect(() => {
    setMetrics(initialMetrics);
  }, [initialMetrics]);

  const kpiLabels = useMemo(
    () => getDashboardKpiLabels(parseDashboardDateKey(selectedDateKey)),
    [selectedDateKey],
  );

  const handleBookingUpdated = useCallback(async () => {
    const nextMetrics = await refreshDashboardMetrics(selectedDateKey);
    setMetrics(nextMetrics);
  }, [selectedDateKey]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-6">
        <StatGrid
          todaysBookings={metrics.todaysBookings}
          todaysRevenue={metrics.todaysRevenue}
          inService={metrics.inService}
          activeCustomers={metrics.activeCustomers}
          bookingsTrendPct={metrics.bookingsTrendPct}
          customersTrendPct={metrics.customersTrendPct}
          bookingTrend7={metrics.bookingTrend7}
          revenueTrend7={metrics.revenueTrend7.map((point) => point.value)}
          bookingsLabel={kpiLabels.bookings}
          revenueLabel={kpiLabels.revenue}
        />

        <RecentBookings
          bookings={metrics.recentBookings}
          onBookingUpdated={handleBookingUpdated}
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <RevenueTrendChart points={metrics.revenueTrend7} />
          <TopServices services={metrics.topServices} />
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <QuickActions />
        <RecentCustomers customers={metrics.recentCustomers} />
        <UpcomingSchedule
          bookings={metrics.upcomingBookings}
          title={kpiLabels.schedule}
        />
        <LiveActivity activity={metrics.liveActivity} />
      </aside>
    </div>
  );
}
