"use client"

import { ManagementListFilters } from "@/components/listing/management"

type BranchesPageFiltersProps = {
  hasActiveFilters: boolean
}

export function BranchesPageFilters({ hasActiveFilters }: BranchesPageFiltersProps) {
  return (
    <ManagementListFilters
      searchPlaceholder="Search branch name, code, or address"
      searchAriaLabel="Search branches"
      hasActiveFilters={hasActiveFilters}
    />
  )
}
