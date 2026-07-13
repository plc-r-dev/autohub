import { redirect } from "next/navigation";
import {
  DashboardHeader,
  QuickActions,
  ReadinessNotice,
  RecentBookings,
  RecentCustomers,
  StatGrid,
  TopServices,
  UpcomingSchedule,
} from "@/components/dashboard";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { getServiceStoreReadiness } from "@/lib/service-store/application/readiness-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { roleLabel, SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";
import { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

export default async function ServiceStoreDashboardPage() {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.STORE_VIEW);

  if (ctx.serviceStore.status === "ONBOARDING") {
    redirect("/app/setup");
  }

  const [metrics, readiness] = await Promise.all([
    getServiceStoreDashboardMetrics(ctx.serviceStore.id),
    getServiceStoreReadiness(ctx.serviceStore.id),
  ]);

  return (
    <PageShell
      title={`Welcome back, ${[ctx.user.firstName, ctx.user.lastName].filter(Boolean).join(" ")}`}
      description={`Performance overview for ${ctx.serviceStore.name}`}
      nav={serviceStoreNav}
    >
      <DashboardHeader
        storeCode={ctx.serviceStore.code}
        role={roleLabel(ctx.membership.role)}
        status={ctx.serviceStore.status}
      />

      <ReadinessNotice readiness={readiness} />

      {!metrics ? (
        <EmptyState message="No service store metrics available." />
      ) : (
        <>
          <StatGrid
            todaysBookings={metrics.todaysBookings}
            todaysRevenue={metrics.todaysRevenue}
            inService={metrics.statusCount.IN_PROGRESS}
            outstandingBilling={metrics.outstandingBilling}
          />

          <QuickActions />

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <RecentBookings bookings={metrics.recentBookings} />
            <UpcomingSchedule bookings={metrics.upcomingBookings} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <TopServices services={metrics.topServices} />
            <RecentCustomers customers={metrics.recentCustomers} />
          </section>
        </>
      )}
    </PageShell>
  );
}
