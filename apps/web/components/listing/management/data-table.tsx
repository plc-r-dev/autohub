import Link from "next/link"
import type { ComponentType, ReactNode } from "react"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ManagementListPagination } from "@/components/listing/management/list-pagination"
import {
  managementTableCardClassName,
  managementTableHeaderClassName,
  managementTableRowClassName,
} from "@/components/listing/management/styles"

export type ManagementTableColumn<T> = {
  key: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

type ManagementDataTableProps<T> = {
  rows: T[]
  columns: ManagementTableColumn<T>[]
  getRowKey: (row: T) => string
  rowHref?: (row: T) => string
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

export function ManagementDataTable<T>({
  rows,
  columns,
  getRowKey,
  rowHref,
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
}: ManagementDataTableProps<T>) {
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
              {rows.map((row) => {
                const href = rowHref?.(row)

                return (
                  <tr
                    key={getRowKey(row)}
                    className={
                      href
                        ? managementTableRowClassName
                        : "border-b border-border last:border-b-0"
                    }
                  >
                    {columns.map((column, columnIndex) => {
                      const content = column.render(row)

                      return (
                        <td
                          key={column.key}
                          className={`px-5 py-4 align-middle ${column.className ?? ""}`}
                        >
                          {href && columnIndex === 0 ? (
                            <Link
                              href={href}
                              className="block text-inherit no-underline"
                            >
                              {content}
                            </Link>
                          ) : (
                            content
                          )}
                        </td>
                      )
                    })}
                    {actionColumn ? (
                      <td className="px-5 py-4 text-right align-middle">
                        {actionColumn.render(row)}
                      </td>
                    ) : null}
                  </tr>
                )
              })}
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
