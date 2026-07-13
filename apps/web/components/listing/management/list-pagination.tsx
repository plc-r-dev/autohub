import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export const MANAGEMENT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export const DEFAULT_MANAGEMENT_PAGE_SIZE = 20

type ManagementListPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  searchParams: Record<string, string | undefined>
  itemLabel?: string
}

export function buildManagementListHref(
  searchParams: Record<string, string | undefined>,
  updates: { page?: number; pageSize?: number } = {},
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || key === "pageSize") {
      continue
    }
    if (value) {
      params.set(key, value)
    }
  }

  const nextPage = updates.page ?? Math.max(1, Number(searchParams.page ?? 1) || 1)
  const nextPageSize =
    updates.pageSize ??
    (Number(searchParams.pageSize ?? DEFAULT_MANAGEMENT_PAGE_SIZE) ||
      DEFAULT_MANAGEMENT_PAGE_SIZE)

  if (nextPage > 1) {
    params.set("page", String(nextPage))
  }
  if (nextPageSize !== DEFAULT_MANAGEMENT_PAGE_SIZE) {
    params.set("pageSize", String(nextPageSize))
  }

  const query = params.toString()
  return query ? `?${query}` : "?"
}

function getVisiblePages(current: number, total: number) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right)
}

export function ManagementListPagination({
  page,
  pageSize,
  totalCount,
  searchParams,
  itemLabel = "items",
}: ManagementListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalCount)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of <span className="font-medium text-foreground">{totalCount}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Per page</span>
          <span className="flex items-center gap-1">
            {MANAGEMENT_PAGE_SIZE_OPTIONS.map((size) => (
              <Link
                key={size}
                href={buildManagementListHref(searchParams, { page: 1, pageSize: size })}
                className={cn(
                  "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-sm font-medium transition-colors",
                  pageSize === size
                    ? "bg-[#16A34A] text-white dark:border dark:border-border dark:bg-muted dark:text-foreground"
                    : "border border-border bg-card text-muted-foreground hover:border-[#16A34A]/35 hover:bg-muted",
                )}
              >
                {size}
              </Link>
            ))}
          </span>
        </label>

        {totalPages > 1 ? (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Link
              href={buildManagementListHref(searchParams, {
                page: Math.max(1, currentPage - 1),
              })}
              aria-disabled={currentPage <= 1}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted",
                currentPage <= 1 && "pointer-events-none opacity-40",
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Link>

            {visiblePages.map((pageNumber, index) => {
              const previous = visiblePages[index - 1]
              const showEllipsis = previous != null && pageNumber - previous > 1

              return (
                <span key={pageNumber} className="flex items-center gap-1">
                  {showEllipsis ? (
                    <span className="px-1 text-sm text-muted-foreground">…</span>
                  ) : null}
                  <Link
                    href={buildManagementListHref(searchParams, { page: pageNumber })}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      pageNumber === currentPage
                        ? "bg-[#16A34A] text-white dark:border dark:border-border dark:bg-muted dark:text-foreground"
                        : "border border-border bg-card text-muted-foreground hover:border-[#16A34A]/35 hover:bg-muted",
                    )}
                  >
                    {pageNumber}
                  </Link>
                </span>
              )
            })}

            <Link
              href={buildManagementListHref(searchParams, {
                page: Math.min(totalPages, currentPage + 1),
              })}
              aria-disabled={currentPage >= totalPages}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted",
                currentPage >= totalPages && "pointer-events-none opacity-40",
              )}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Link>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
