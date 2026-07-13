import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { portalCardClassName } from "@/components/service-store/ui/portal-surfaces";
import { formatPrice } from "@/lib/booking/format";
import { cn } from "@workspace/ui/lib/utils";

type RevenueTrendChartProps = {
  points: Array<{ label: string; value: number }>;
};

/** Seven-day revenue bars — latest day highlighted. */
export function RevenueTrendChart({ points }: RevenueTrendChartProps) {
  const max = points.reduce((peak, point) => Math.max(peak, point.value), 0) || 1;

  return (
    <Card className={portalCardClassName}>
      <CardHeader>
        <SectionHeader title="Revenue trend" description="Last 7 days" />
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground">No revenue data yet.</p>
        ) : (
          <div className="flex h-44 items-end justify-between gap-2">
            {points.map((point, index) => {
              const heightPct = Math.max((point.value / max) * 100, 6);
              const isLatest = index === points.length - 1;

              return (
                <div
                  key={`${point.label}-${index}`}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {point.value > 0 ? formatCompactPrice(point.value) : ""}
                  </span>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        isLatest ? "bg-[#16A34A]" : "bg-emerald-100",
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      isLatest ? "font-semibold text-[#166534] dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCompactPrice(amount: number) {
  if (amount >= 1000) {
    return `฿${(amount / 1000).toFixed(1)}k`;
  }
  return formatPrice(amount);
}
