"use client"

import { ManagementListFilterSelect, ManagementListFilters } from "@/components/listing/management"

type ServicesPageFiltersProps = {
  hasActiveFilters: boolean
}

export function ServicesPageFilters({ hasActiveFilters }: ServicesPageFiltersProps) {
  return (
    <ManagementListFilters
      searchPlaceholder="Search service name"
      searchAriaLabel="Search services"
      hasActiveFilters={hasActiveFilters}
    >
      <ManagementListFilterSelect
        paramKey="status"
        ariaLabel="Service status"
        placeholder="All statuses"
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
    </ManagementListFilters>
  )
}
