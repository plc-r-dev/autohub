import { Activity, CalendarPlus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";
import { formatRelativeTime } from "@/lib/booking/format";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";
import { cn } from "@workspace/ui/lib/utils";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type LiveActivityProps = {
  activity: Metrics["liveActivity"];
};

const ICONS = {
  booking: CalendarPlus,
  completed: CheckCircle2,
} as const;

/** Recent booking and completion events from the last 24 hours. */
export function LiveActivity({ activity }: LiveActivityProps) {
  return (
    <Card className={portalCardClassName}>
      <CardHeader>
        <SectionHeader title="Live activity" />
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState icon={Activity} message="No recent activity." />
        ) : (
          <ul className="space-y-3">
            {activity.map((item) => {
              const Icon = ICONS[item.type] ?? Activity;
              return (
                <li key={item.id} className="flex gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      item.type === "completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </p>
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
