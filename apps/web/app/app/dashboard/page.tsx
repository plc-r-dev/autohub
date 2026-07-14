import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";
import { parseDashboardDateKey } from "@/lib/reporting/dashboard-date";
import { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function ServiceStoreDashboardPage({ searchParams }: PageProps) {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.STORE_VIEW);

  const params = await searchParams;
  const selectedDate = parseDashboardDateKey(params.date);
  const metrics = await getServiceStoreDashboardMetrics(ctx.serviceStore.id, {
    date: selectedDate,
  });

  const displayName =
    [ctx.user.firstName, ctx.user.lastName].filter(Boolean).join(" ").trim() ||
    "there";

  return (
    <PageShell
      title="Overview"
      description={`Welcome back, ${displayName}.`}
      nav={serviceStoreNav}
      actions={
        <Suspense fallback={null}>
          <DashboardDateFilter />
        </Suspense>
      }
    >
      {!metrics ? (
        <EmptyState message="No service store metrics available." />
      ) : (
        <Suspense
          fallback={
            <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40" />
          }
        >
          <DashboardOverview initialMetrics={metrics} />
        </Suspense>
      )}
    </PageShell>
  );
}
