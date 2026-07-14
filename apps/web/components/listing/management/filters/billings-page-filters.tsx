"use client"

import {
  ManagementListFilterSelect,
  ManagementListFilters,
} from "@/components/listing/management"
import { managementSelectClassName } from "@/components/listing/management/styles"
import { useListParams } from "@/components/listing/management/use-list-params"
import { BILLING_STATUSES, BILLING_STATUS_LABELS } from "@/lib/billing/domain"

type BillingsPageFiltersProps = {
  hasActiveFilters: boolean
  periodOptions: Array<{ value: string; label: string }>
}

function PeriodFilter({
  options,
}: {
  options: Array<{ value: string; label: string }>
}) {
  const { searchParams, updateParams } = useListParams()
  const currentValue = searchParams.get("period") ?? ""

  return (
    <label className="relative min-w-[9.5rem]">
      <span className="sr-only">Filter by period</span>
      <select
        value={currentValue}
        onChange={(event) =>
          updateParams((params) => {
            if (event.target.value) {
              params.set("period", event.target.value)
            } else {
              params.delete("period")
            }
          })
        }
        className={managementSelectClassName(Boolean(currentValue))}
        aria-label="Filter by period"
      >
        <option value="">All periods</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function BillingsPageFilters({
  hasActiveFilters,
  periodOptions,
}: BillingsPageFiltersProps) {
  return (
    <ManagementListFilters showSearch={false} hasActiveFilters={hasActiveFilters}>
      <PeriodFilter options={periodOptions} />
      <ManagementListFilterSelect
        paramKey="status"
        ariaLabel="Filter by status"
        placeholder="All statuses"
        options={BILLING_STATUSES.map((status) => ({
          value: status,
          label: BILLING_STATUS_LABELS[status],
        }))}
      />
    </ManagementListFilters>
  )
}
