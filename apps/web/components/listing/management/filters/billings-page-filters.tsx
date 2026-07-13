"use client"

import { ManagementListFilterSelect, ManagementListFilters } from "@/components/listing/management"
import { billingStatusLabel } from "@/lib/billing/format"
import type { BillingStatus } from "@/lib/generated/prisma/client"

const BILLING_STATUS_OPTIONS: BillingStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "PAYMENT_SUBMITTED",
  "PAYMENT_REJECTED",
  "PAID",
]

type BillingsPageFiltersProps = {
  hasActiveFilters: boolean
}

export function BillingsPageFilters({ hasActiveFilters }: BillingsPageFiltersProps) {
  return (
    <ManagementListFilters
      searchPlaceholder="Search invoice or receipt number"
      searchAriaLabel="Search billings"
      hasActiveFilters={hasActiveFilters}
    >
      <ManagementListFilterSelect
        paramKey="status"
        ariaLabel="Billing status"
        placeholder="All statuses"
        options={BILLING_STATUS_OPTIONS.map((status) => ({
          value: status,
          label: billingStatusLabel(status),
        }))}
      />
    </ManagementListFilters>
  )
}
