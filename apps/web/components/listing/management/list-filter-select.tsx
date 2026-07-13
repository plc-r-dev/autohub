"use client"

import { managementSelectClassName } from "@/components/listing/management/styles"
import { useListParams } from "@/components/listing/management/use-list-params"

type Option = { value: string; label: string }

type ManagementListFilterSelectProps = {
  paramKey: string
  ariaLabel: string
  placeholder: string
  options: Option[]
}

export function ManagementListFilterSelect({
  paramKey,
  ariaLabel,
  placeholder,
  options,
}: ManagementListFilterSelectProps) {
  const { searchParams, updateParams } = useListParams()
  const currentValue = searchParams.get(paramKey) ?? ""

  return (
    <label className="relative min-w-[9.5rem]">
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={currentValue}
        onChange={(event) =>
          updateParams((params) => {
            if (event.target.value) {
              params.set(paramKey, event.target.value)
            } else {
              params.delete(paramKey)
            }
          })
        }
        className={managementSelectClassName(Boolean(currentValue))}
        aria-label={ariaLabel}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
