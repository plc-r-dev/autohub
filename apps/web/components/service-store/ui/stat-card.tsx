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
        "flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>

          <p className="mt-1 text-[2rem] leading-none font-semibold tracking-tight text-foreground">
            {value}
          </p>

          {hint ? (
            <p className="mt-1.5 text-xs text-muted-foreground/80">
              {hint}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        ) : null}
      </div>
    </article>
  );
}