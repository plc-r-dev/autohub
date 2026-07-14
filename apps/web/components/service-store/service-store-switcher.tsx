"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

/** Header control — opens the dedicated Store Selection page (no dropdown). */
export function ServiceStoreSwitcher({
  storeName,
  roleLabel: role,
}: {
  storeName: string
  roleLabel?: string
}) {
  return (
    <Link
      href="/app"
      aria-label="Switch Service Store"
      title="Switch Service Store"
      className={cn(
        "inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5",
        "text-xs font-medium text-foreground transition-colors hover:bg-accent",
      )}
    >
      <span className="truncate">
        {storeName}
        {role ? ` · ${role}` : ""}
      </span>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
