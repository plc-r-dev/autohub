"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"

type Option = { value: string; label: string }

type FilterConfig = {
  key: string
  label: string
  options: Option[]
}

type AdminListToolbarProps = {
  searchPlaceholder?: string
  filters?: FilterConfig[]
  pageSizeOptions?: number[]
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function AdminListToolbar({
  searchPlaceholder = "Search...",
  filters = [],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: AdminListToolbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "")

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "")
  }, [searchParams])

  const currentSort = searchParams.get("sort") ?? "desc"
  const currentPageSize = Number(searchParams.get("pageSize") ?? 20)

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const currentSearch = searchParams.get("q") ?? ""
      if (currentSearch === searchText.trim()) return
      updateParams((params) => {
        if (searchText.trim()) {
          params.set("q", searchText.trim())
        } else {
          params.delete("q")
        }
        params.set("page", "1")
      })
    }, 300)
    return () => clearTimeout(handle)
  }, [searchText])

  const filterValues = useMemo(() => {
    const values: Record<string, string> = {}
    for (const filter of filters) {
      values[filter.key] = searchParams.get(filter.key) ?? ""
    }
    return values
  }, [filters, searchParams])

  return (
    <AdminSectionCard>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        useFlexGap
        sx={{ flexWrap: "wrap" }}
      >
        <TextField
          label="Search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={searchPlaceholder}
          sx={{ minWidth: { md: 220 }, flex: 1 }}
        />
        {filters.map((filter) => (
          <TextField
            key={filter.key}
            select
            label={filter.label}
            value={filterValues[filter.key]}
            onChange={(event) =>
              updateParams((params) => {
                if (event.target.value) {
                  params.set(filter.key, event.target.value)
                } else {
                  params.delete(filter.key)
                }
                params.set("page", "1")
              })
            }
            sx={{ minWidth: { md: 180 }, flex: 1 }}
          >
            <MenuItem value="">All</MenuItem>
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <TextField
          select
          label="Sort"
          value={currentSort}
          onChange={(event) =>
            updateParams((params) => {
              params.set("sort", event.target.value)
              params.set("page", "1")
            })
          }
          sx={{ minWidth: { md: 140 } }}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </TextField>
        <TextField
          select
          label="Page size"
          value={String(currentPageSize)}
          onChange={(event) =>
            updateParams((params) => {
              params.set("pageSize", event.target.value)
              params.set("page", "1")
            })
          }
          sx={{ minWidth: { md: 120 } }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </AdminSectionCard>
  )
}
