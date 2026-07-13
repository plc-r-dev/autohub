import { cn } from "@workspace/ui/lib/utils"

export function DetailModalTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      className="flex gap-1 border-b border-border"
      role="tablist"
      aria-label="Customer detail sections"
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[#16A34A] text-foreground dark:border-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function DetailModalSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function DetailModalMetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>
}

export function DetailModalMetric({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function DetailModalList({
  children,
  emptyMessage,
}: {
  children: React.ReactNode
  emptyMessage?: string
}) {
  if (!children) {
    return emptyMessage ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : null
  }

  return <ul className="divide-y divide-border rounded-xl border border-border">{children}</ul>
}

export function DetailModalListItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const Comp = onClick ? "button" : "li"

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm",
        onClick && "transition-colors hover:bg-muted/50",
        className,
      )}
    >
      {children}
    </Comp>
  )
}
