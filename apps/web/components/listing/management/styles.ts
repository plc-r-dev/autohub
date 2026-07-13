export const managementPillBase =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 text-sm font-medium transition-all"

export const managementPillInactive =
  "border border-border bg-card text-muted-foreground hover:border-[#16A34A]/35 hover:bg-muted hover:text-foreground"

export const managementPillActive =
  "border border-[#16A34A] bg-[#16A34A] text-white shadow-sm dark:border-border dark:bg-muted dark:text-foreground"

export const managementSearchInputClassName =
  "h-11 w-full rounded-full border border-border bg-card pr-11 pl-11 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-[#16A34A]/35 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15"

export const managementSelectClassName = (active: boolean) =>
  [
    "h-9 w-full min-w-[9.5rem] cursor-pointer appearance-none rounded-full border px-3.5 pr-8 text-sm font-medium outline-none transition-colors",
    active
      ? "border-[#16A34A] bg-[#16A34A]/10 text-[#166534] dark:border-foreground dark:bg-muted dark:text-foreground"
      : "border-border bg-card text-muted-foreground hover:border-[#16A34A]/35",
    "focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15",
  ].join(" ")

export const managementTableCardClassName =
  "overflow-hidden rounded-2xl border border-border bg-card shadow-sm"

export const managementTableHeaderClassName =
  "border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"

export const managementTableRowClassName =
  "cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/50"
