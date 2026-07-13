import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type TopServicesProps = {
  services: Metrics["topServices"];
};

/** Most-booked services in the last 30 days, with a bar proportional to the top service's volume. */
export function TopServices({ services }: TopServicesProps) {
  const maxQty = services[0]?.qty || 1;

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <SectionHeader title="Top services" description="Last 30 days" />
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <EmptyState icon={Wrench} message="No completed service data." />
        ) : (
          <ul className="space-y-3">
            {services.map((service) => {
              const sharePct = Math.round((service.qty / maxQty) * 100);
              return (
                <li key={service.serviceName}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-foreground">{service.serviceName}</span>
                    <span className="font-semibold text-muted-foreground">{service.qty}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${sharePct}%` }} />
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
