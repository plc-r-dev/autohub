import Link from "next/link";
import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type ListTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyLabel: string;
  noResultLabel?: string;
  hasFilters?: boolean;
};

export function ListTable<T>({
  columns,
  rows,
  getRowKey,
  emptyLabel,
  noResultLabel = "No results match the current filters.",
  hasFilters = false,
}: ListTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground rounded-md border p-6 text-sm">
        {hasFilters ? noResultLabel : emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="border-t align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: Record<string, string | undefined>;
};

function buildPageHref(
  page: number,
  searchParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export function ListPagination({
  page,
  pageSize,
  totalCount,
  searchParams,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {totalCount} total · Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Link
          aria-disabled={currentPage <= 1}
          href={buildPageHref(Math.max(1, currentPage - 1), searchParams)}
          className="border-input hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50 rounded-md border px-3 py-1.5"
        >
          Previous
        </Link>
        <Link
          aria-disabled={currentPage >= totalPages}
          href={buildPageHref(Math.min(totalPages, currentPage + 1), searchParams)}
          className="border-input hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50 rounded-md border px-3 py-1.5"
        >
          Next
        </Link>
      </div>
    </div>
  );
}

type ErrorStateProps = {
  message: string;
};

export function ListErrorState({ message }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-destructive/40 bg-destructive/5 flex items-center justify-between rounded-md border p-4"
    >
      <p className="text-sm">{message}</p>
      <Link href="." className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm">
        Retry
      </Link>
    </div>
  );
}
