"use client"

import Link from "next/link"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

type AdminListPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  searchParams: Record<string, string | undefined>
}

function buildPageHref(
  page: number,
  searchParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value)
  }
  params.set("page", String(page))
  return `?${params.toString()}`
}

export function AdminListPagination({
  page,
  pageSize,
  totalCount,
  searchParams,
}: AdminListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography variant="body2" color="text.secondary">
        {totalCount} total · Page {currentPage} of {totalPages}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          component={Link}
          href={buildPageHref(Math.max(1, currentPage - 1), searchParams)}
          variant="outlined"
          size="small"
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <Button
          component={Link}
          href={buildPageHref(
            Math.min(totalPages, currentPage + 1),
            searchParams,
          )}
          variant="outlined"
          size="small"
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  )
}
