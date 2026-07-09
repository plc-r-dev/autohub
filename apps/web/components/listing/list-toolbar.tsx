"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

type FilterConfig = {
  key: string;
  label: string;
  options: Option[];
};

type ListToolbarProps = {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ListToolbar({
  searchPlaceholder = "Search...",
  filters = [],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: ListToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "");
  }, [searchParams]);

  const currentSort = searchParams.get("sort") ?? "desc";
  const currentPageSize = Number(searchParams.get("pageSize") ?? 20);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const currentSearch = searchParams.get("q") ?? "";
      if (currentSearch === searchText.trim()) {
        return;
      }
      updateParams((params) => {
        if (searchText.trim()) {
          params.set("q", searchText.trim());
        } else {
          params.delete("q");
        }
        params.set("page", "1");
      });
    }, 300);

    return () => clearTimeout(handle);
  }, [searchText]);

  const filterValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const filter of filters) {
      values[filter.key] = searchParams.get(filter.key) ?? "";
    }
    return values;
  }, [filters, searchParams]);

  return (
    <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Search</span>
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={searchPlaceholder}
          className="border-input h-9 rounded-md border px-3"
        />
      </label>

      {filters.map((filter) => (
        <label key={filter.key} className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{filter.label}</span>
          <select
            value={filterValues[filter.key]}
            onChange={(event) =>
              updateParams((params) => {
                if (event.target.value) {
                  params.set(filter.key, event.target.value);
                } else {
                  params.delete(filter.key);
                }
                params.set("page", "1");
              })
            }
            className="border-input h-9 rounded-md border px-3"
          >
            <option value="">All</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Sort</span>
        <select
          value={currentSort}
          onChange={(event) =>
            updateParams((params) => {
              params.set("sort", event.target.value);
              params.set("page", "1");
            })
          }
          className="border-input h-9 rounded-md border px-3"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Page size</span>
        <select
          value={String(currentPageSize)}
          onChange={(event) =>
            updateParams((params) => {
              params.set("pageSize", event.target.value);
              params.set("page", "1");
            })
          }
          className="border-input h-9 rounded-md border px-3"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
