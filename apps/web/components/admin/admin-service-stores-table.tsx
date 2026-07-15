"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { setServiceStoreAdminStatus } from "@/lib/service-store/actions"

type StoreRow = {
  id: string
  name: string
  code: string
  status: string
  bookingEnabled: boolean
  phone: string | null
  email: string | null
  branchCount: number
  memberCount: number
  updatedAt: string
}

type AdminServiceStoresTableProps = {
  rows: StoreRow[]
}

function StoreStatusActions({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (status === "SUSPENDED") {
    return (
      <Button
        size="small"
        variant="outlined"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setServiceStoreAdminStatus(id, "ACTIVE")
            router.refresh()
          })
        }
      >
        Activate
      </Button>
    )
  }

  if (status === "ACTIVE") {
    return (
      <Button
        size="small"
        color="warning"
        variant="outlined"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setServiceStoreAdminStatus(id, "SUSPENDED")
            router.refresh()
          })
        }
      >
        Suspend
      </Button>
    )
  }

  return null
}

export function AdminServiceStoresTable({ rows }: AdminServiceStoresTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = React.useState(searchParams.get("q") ?? "")
  const [status, setStatus] = React.useState(searchParams.get("status") ?? "ALL")

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (status && status !== "ALL") params.set("status", status)
    router.replace(`/admin/service-stores/active?${params.toString()}`)
  }

  const columns: GridColDef<StoreRow>[] = [
    {
      field: "name",
      headerName: "Store",
      flex: 1.4,
      minWidth: 180,
      valueGetter: (_v, row) => `${row.name} (${row.code})`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => (
        <AdminStatusChip label={params.row.status} status={params.row.status} />
      ),
    },
    {
      field: "bookingEnabled",
      headerName: "Booking",
      flex: 0.7,
      minWidth: 100,
      valueGetter: (_v, row) => (row.bookingEnabled ? "Enabled" : "Off"),
    },
    {
      field: "branchCount",
      headerName: "Branches",
      flex: 0.6,
      minWidth: 90,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "memberCount",
      headerName: "Members",
      flex: 0.6,
      minWidth: 90,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 120,
      valueGetter: (_v, row) => row.phone ?? "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 220,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "flex-end", width: "100%" }}
        >
          <Button
            component={Link}
            href={`/admin/service-stores/${params.row.id}`}
            size="small"
            variant="text"
          >
            View
          </Button>
          <StoreStatusActions id={params.row.id} status={params.row.status} />
        </Stack>
      ),
    },
  ]

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <form onSubmit={applyFilters}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            useFlexGap
            sx={{ flexWrap: "wrap", alignItems: { sm: "flex-end" } }}
          >
            <TextField
              size="small"
              label="Search"
              placeholder="Name, code, phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 220, flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="ONBOARDING">ONBOARDING</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" size="small">
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => {
                setQ("")
                setStatus("ALL")
                router.replace("/admin/service-stores/active")
              }}
            >
              Reset
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper variant="outlined" sx={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slots={{
            noRowsOverlay: () => (
              <Stack
                sx={{
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No service stores match the current filters.
                </Typography>
              </Stack>
            ),
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
          }}
        />
      </Paper>
    </Stack>
  )
}
