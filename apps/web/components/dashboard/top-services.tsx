import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";
import { cn } from "@workspace/ui/lib/utils";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type TopServicesProps = {
  services: Metrics["topServices"];
};

/** Most-booked services in the last 30 days, with share bars. */
export function TopServices({ services }: TopServicesProps) {
  const totalQty = services.reduce((sum, service) => sum + service.qty, 0) || 1;

  return (
    <Card className={cn("h-full", portalCardClassName)}>
      <CardHeader>
        <SectionHeader title="Top performing services" description="Last 30 days" />
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <EmptyState icon={Wrench} message="No completed service data." />
        ) : (
          <ul className="space-y-5">
            {services.map((service) => {
              const sharePct = Math.round((service.qty / totalQty) * 100);
              return (
                <li key={service.serviceName}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="truncate font-medium text-foreground">
                      {service.serviceName}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-[#166534] dark:text-emerald-400">
                      {sharePct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#16A34A] to-emerald-400"
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
