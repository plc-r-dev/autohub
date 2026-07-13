"use client"

import { ManagementListFilters } from "@/components/listing/management"

type ServicesPageFiltersProps = {
  hasActiveFilters: boolean
}

export function ServicesPageFilters({ hasActiveFilters }: ServicesPageFiltersProps) {
  return (
    <ManagementListFilters
      searchPlaceholder="Search service name"
      searchAriaLabel="Search services"
      hasActiveFilters={hasActiveFilters}
    />
  )
}
