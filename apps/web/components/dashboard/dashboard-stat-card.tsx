import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";
import { cn } from "@workspace/ui/lib/utils";

type AccentTone = "emerald" | "green" | "sky" | "violet";

const ACCENT_STYLES: Record<
  AccentTone,
  { card: string; icon: string; value: string; bar: string }
> = {
  emerald: {
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-card to-card dark:border-emerald-900/40 dark:from-emerald-950/30",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-950 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  green: {
    card: "border-[#b8ebd0]/80 bg-gradient-to-br from-[#f0fdf4] via-card to-card dark:border-emerald-900/40 dark:from-emerald-950/30",
    icon: "bg-[#16A34A]/15 text-[#166534] dark:text-emerald-400",
    value: "text-[#166534] dark:text-emerald-300",
    bar: "bg-[#16A34A]",
  },
  sky: {
    card: "border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-card to-card dark:border-sky-900/40 dark:from-sky-950/30",
    icon: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    value: "text-sky-950 dark:text-sky-300",
    bar: "bg-sky-500",
  },
  violet: {
    card: "border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-card to-card dark:border-violet-900/40 dark:from-violet-950/30",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    value: "text-violet-950 dark:text-violet-300",
    bar: "bg-violet-500",
  },
};

type DashboardStatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  accent?: AccentTone;
  trendPct?: number | null;
  sparkline?: number[];
  progressPct?: number;
  stableLabel?: string;
  className?: string;
};

/** KPI tile styled for the service-store dashboard. */
export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  accent = "green",
  trendPct,
  sparkline,
  progressPct,
  stableLabel,
  className,
}: DashboardStatCardProps) {
  const tone = ACCENT_STYLES[accent];
  const trendVariant =
    trendPct == null ? null : trendPct >= 0 ? "positive" : "negative";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        tone.card,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                tone.icon,
              )}
            >
              <Icon className="size-4" strokeWidth={2.25} />
            </div>
          ) : null}
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
        </div>
        {trendPct != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trendPct >= 0
                ? "bg-emerald-500/15 text-emerald-700"
                : "bg-rose-500/15 text-rose-600",
            )}
          >
            {trendPct >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trendPct > 0 ? "+" : ""}
            {trendPct}%
          </span>
        ) : stableLabel ? (
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            {stableLabel}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-3 text-[2rem] leading-none font-semibold tracking-tight",
          tone.value,
        )}
      >
        {value}
      </p>

      {progressPct != null && progressPct > 0 ? (
        <div className="mt-4 h-1.5 rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", tone.bar)}
            style={{ width: `${Math.min(Math.max(progressPct, 8), 100)}%` }}
          />
        </div>
      ) : sparkline && sparkline.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <MiniSparkline
            values={sparkline}
            variant={trendVariant ?? "default"}
          />
        </div>
      ) : null}
    </article>
  );
}
