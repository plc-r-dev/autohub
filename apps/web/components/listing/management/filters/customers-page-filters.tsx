"use client"

import { ManagementListFilters } from "@/components/listing/management"

type CustomersPageFiltersProps = {
  hasActiveFilters: boolean
}

export function CustomersPageFilters({ hasActiveFilters }: CustomersPageFiltersProps) {
  return (
    <ManagementListFilters
      searchPlaceholder="Search name, phone, or plate"
      searchAriaLabel="Search customers"
      hasActiveFilters={hasActiveFilters}
    />
  )
}
