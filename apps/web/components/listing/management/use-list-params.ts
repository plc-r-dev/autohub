"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function useListParams() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParams(
    updater: (params: URLSearchParams) => void,
    options?: { resetPage?: boolean },
  ) {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    if (options?.resetPage !== false) {
      params.delete("page")
      params.delete("pageSize")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  function resetParams() {
    router.replace(pathname)
  }

  return { pathname, searchParams, updateParams, resetParams }
}
