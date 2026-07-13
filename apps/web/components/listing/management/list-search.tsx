"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { managementSearchInputClassName } from "@/components/listing/management/styles"
import { useListParams } from "@/components/listing/management/use-list-params"

type ManagementListSearchProps = {
  placeholder: string
  ariaLabel?: string
}

export function ManagementListSearch({
  placeholder,
  ariaLabel = "Search",
}: ManagementListSearchProps) {
  const { searchParams, updateParams } = useListParams()
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "")

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "")
  }, [searchParams])

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
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder={placeholder}
        className={managementSearchInputClassName}
        aria-label={ariaLabel}
      />
      {searchText ? (
        <button
          type="button"
          onClick={() => setSearchText("")}
          className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
