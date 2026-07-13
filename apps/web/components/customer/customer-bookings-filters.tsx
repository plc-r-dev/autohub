"use client"

import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchBar } from "@/components/customer/ui/search-bar"
import { BOOKING_STATUS_OPTIONS } from "@/lib/booking/format"
import { cn } from "@workspace/ui/lib/utils"

const pillBase =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-all"

const pillInactive =
  "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#16A34A]/35 hover:bg-[#F0FDF4] hover:text-[#0F172A]"

const pillActive =
  "border border-[#16A34A] bg-[#16A34A] text-white shadow-sm dark:border-border dark:bg-muted dark:text-foreground"

export function CustomerBookingsFilters() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "")
  const currentStatus = searchParams.get("status") ?? ""

  const hasActiveFilters = useMemo(
    () => Boolean(searchParams.get("q") || searchParams.get("status")),
    [searchParams],
  )

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "")
  }, [searchParams])

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    params.delete("page")
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const currentSearch = searchParams.get("q") ?? ""
      if (currentSearch === searchText.trim()) {
        return
      }
      updateParams((params) => {
        if (searchText.trim()) {
          params.set("q", searchText.trim())
        } else {
          params.delete("q")
        }
      })
    }, 300)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search shop, plate, or booking no."
          className="[&_input]:h-12 [&_input]:rounded-2xl [&_input]:pr-11"
        />
        {searchText ? (
          <button
            type="button"
            onClick={() => setSearchText("")}
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() =>
            updateParams((params) => {
              params.delete("status")
            })
          }
          className={cn(pillBase, currentStatus === "" ? pillActive : pillInactive)}
        >
          All
        </button>
        {BOOKING_STATUS_OPTIONS.map((filter) => {
          const active = currentStatus === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                updateParams((params) => {
                  params.set("status", filter.value)
                })
              }
              className={cn(pillBase, active ? pillActive : pillInactive)}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => {
            setSearchText("")
            router.replace(pathname)
          }}
          className="self-start text-sm font-semibold text-[#16A34A] hover:text-[#15803D]"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )
}
