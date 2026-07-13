"use client"

import type { ComponentType, ReactNode } from "react"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ManagementListPagination } from "@/components/listing/management/list-pagination"
import {
  managementTableCardClassName,
  managementTableHeaderClassName,
  managementTableRowClassName,
} from "@/components/listing/management/styles"
import type { ManagementTableColumn } from "@/components/listing/management/data-table"

type ManagementInteractiveDataTableProps<T> = {
  rows: T[]
  columns: ManagementTableColumn<T>[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyIcon?: ComponentType<{ className?: string }>
  emptyMessage: string
  filteredEmptyMessage?: string
  hasFilters?: boolean
  page: number
  pageSize: number
  totalCount: number
  searchParams: Record<string, string | undefined>
  itemLabel?: string
  minWidth?: string
  actionColumn?: {
    header?: string
    render: (row: T) => ReactNode
  }
}

export function ManagementInteractiveDataTable<T>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  emptyIcon,
  emptyMessage,
  filteredEmptyMessage = "No results match your filters.",
  hasFilters = false,
  page,
  pageSize,
  totalCount,
  searchParams,
  itemLabel,
  minWidth = "720px",
  actionColumn,
}: ManagementInteractiveDataTableProps<T>) {
  return (
    <div className={managementTableCardClassName}>
      {rows.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          message={hasFilters ? filteredEmptyMessage : emptyMessage}
        />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-sm"
            style={{ minWidth }}
          >
            <thead>
              <tr className={managementTableHeaderClassName}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3.5 font-semibold ${column.className ?? ""}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actionColumn ? (
                  <th className="px-5 py-3.5 text-right font-semibold">
                    {actionColumn.header ?? "Action"}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick
                      ? managementTableRowClassName
                      : "border-b border-border last:border-b-0"
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 align-middle ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  {actionColumn ? (
                    <td
                      className="px-5 py-4 text-right align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {actionColumn.render(row)}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 ? (
        <ManagementListPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchParams={searchParams}
          itemLabel={itemLabel}
        />
      ) : null}
    </div>
  )
}
