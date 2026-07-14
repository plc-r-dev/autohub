"use client"

import type { ReactNode } from "react"
import { ManagementListSearch } from "@/components/listing/management/list-search"
import { useListParams } from "@/components/listing/management/use-list-params"
import {
  managementPillBase,
  managementPillInactive,
} from "@/components/listing/management/styles"
import { cn } from "@workspace/ui/lib/utils"

type ManagementListFiltersProps = {
  searchPlaceholder?: string
  searchAriaLabel?: string
  showSearch?: boolean
  children?: ReactNode
  hasActiveFilters?: boolean
}

export function ManagementListFilters({
  searchPlaceholder = "Search",
  searchAriaLabel,
  showSearch = true,
  children,
  hasActiveFilters = false,
}: ManagementListFiltersProps) {
  const { resetParams } = useListParams()

  return (
    <div className="space-y-3">
      {showSearch ? (
        <ManagementListSearch
          placeholder={searchPlaceholder}
          ariaLabel={searchAriaLabel}
        />
      ) : null}

      {children || hasActiveFilters ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {children ? (
            <div className="flex flex-wrap items-center gap-2">{children}</div>
          ) : (
            <span />
          )}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetParams}
              className={cn(managementPillBase, managementPillInactive, "px-3")}
            >
              Reset
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
