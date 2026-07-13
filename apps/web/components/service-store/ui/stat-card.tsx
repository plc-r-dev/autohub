import { cn } from "@workspace/ui/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </p>

          {hint ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        ) : null}
      </div>
    </article>
  );
}