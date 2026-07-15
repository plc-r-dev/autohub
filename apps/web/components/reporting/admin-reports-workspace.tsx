"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import InputAdornment from "@mui/material/InputAdornment"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import {
  DataGrid,
  type GridColDef,
  type GridFilterModel,
} from "@mui/x-data-grid"
import SearchIcon from "@mui/icons-material/Search"
import {
  formatBillingCurrency,
  formatBillingDate,
  formatBillingPeriod,
} from "@/lib/billing/format"

export type ReportTab =
  | "booking"
  | "billing"
  | "settlement"
  | "customer"
  | "vehicle"

type FilterOption = { id: string; name: string; serviceStoreId?: string }

type ReportRows = {
  booking: Array<Record<string, unknown>>
  billing: Array<Record<string, unknown>>
  settlement: Array<Record<string, unknown>>
  customer: Array<Record<string, unknown>>
  vehicle: Array<Record<string, unknown>>
}

type AdminReportsWorkspaceProps = {
  initialTab: ReportTab
  filters: {
    from?: string
    to?: string
    serviceStoreId?: string
    branchId?: string
    bookingStatus?: string
  }
  serviceStores: FilterOption[]
  branches: FilterOption[]
  reportData: ReportRows
}

const REPORT_TABS: Array<{ value: ReportTab; label: string }> = [
  { value: "booking", label: "Booking" },
  { value: "billing", label: "Billing" },
  { value: "settlement", label: "Settlement" },
  { value: "customer", label: "Customer" },
  { value: "vehicle", label: "Vehicle" },
]

const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  return 0
}

function asString(value: unknown): string {
  if (value == null) return "—"
  const str = String(value).trim()
  return str.length > 0 ? str : "—"
}

function buildExportLink(
  reportType: ReportTab,
  format: "csv" | "excel",
  filters: AdminReportsWorkspaceProps["filters"],
): string {
  const query = new URLSearchParams()
  query.set("type", reportType)
  query.set("format", format)
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value)
  }
  return `/admin/reports/export?${query.toString()}`
}

function bookingColumns(): GridColDef[] {
  return [
    {
      field: "bookingNumber",
      headerName: "Booking Number",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "bookingDate",
      headerName: "Booking Date",
      flex: 1,
      minWidth: 130,
      valueGetter: (_v, row) => asDate(row.bookingDate),
      valueFormatter: (value: Date | null) =>
        value ? formatBillingDate(value) : "—",
    },
    {
      field: "serviceStoreName",
      headerName: "Service Store",
      flex: 1.2,
      minWidth: 150,
    },
    { field: "branchName", headerName: "Branch", flex: 1, minWidth: 120 },
    {
      field: "customerName",
      headerName: "Customer",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "licensePlate",
      headerName: "Vehicle",
      flex: 0.8,
      minWidth: 110,
    },
    {
      field: "service",
      headerName: "Service",
      flex: 1,
      minWidth: 120,
      valueGetter: () => "—",
    },
    {
      field: "totalAmount",
      headerName: "Amount",
      flex: 0.8,
      minWidth: 110,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.totalAmount),
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    { field: "status", headerName: "Status", flex: 0.9, minWidth: 120 },
  ]
}

function billingColumns(): GridColDef[] {
  return [
    {
      field: "billingNumber",
      headerName: "Billing Number",
      flex: 1,
      minWidth: 140,
      valueGetter: (_v, row) => asString(row.billingId),
    },
    {
      field: "billingPeriod",
      headerName: "Billing Period",
      flex: 1,
      minWidth: 130,
      valueGetter: (_v, row) => {
        const start = asDate(row.periodStart)
        return start ? formatBillingPeriod(start) : "—"
      },
    },
    {
      field: "serviceStoreName",
      headerName: "Service Store",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "bookingCount",
      headerName: "Booking Count",
      flex: 0.8,
      minWidth: 120,
      align: "right",
      headerAlign: "right",
      valueGetter: () => "—",
    },
    {
      field: "total",
      headerName: "Amount",
      flex: 0.8,
      minWidth: 110,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.total),
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    { field: "status", headerName: "Status", flex: 0.9, minWidth: 120 },
    {
      field: "paidDate",
      headerName: "Paid Date",
      flex: 1,
      minWidth: 120,
      valueGetter: () => "—",
    },
  ]
}

function settlementColumns(): GridColDef[] {
  return [
    {
      field: "settlementNumber",
      headerName: "Settlement Number",
      flex: 1,
      minWidth: 150,
      valueGetter: (_v, row) => asString(row.billingId),
    },
    {
      field: "serviceStoreName",
      headerName: "Service Store",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "billingPeriod",
      headerName: "Billing Period",
      flex: 1,
      minWidth: 130,
      valueGetter: () => "—",
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 0.8,
      minWidth: 110,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.amount),
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    {
      field: "paymentDate",
      headerName: "Transferred Date",
      flex: 1,
      minWidth: 140,
      valueGetter: (_v, row) => asDate(row.paymentDate),
      valueFormatter: (value: Date | null) =>
        value ? formatBillingDate(value) : "—",
    },
    {
      field: "reviewStatus",
      headerName: "Status",
      flex: 0.9,
      minWidth: 120,
    },
  ]
}

function customerColumns(): GridColDef[] {
  return [
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1.2,
      minWidth: 150,
    },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 120 },
    {
      field: "totalBookings",
      headerName: "Total Bookings",
      flex: 0.8,
      minWidth: 130,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.totalBookings),
    },
    {
      field: "totalSpending",
      headerName: "Total Spending",
      flex: 1,
      minWidth: 130,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.totalSpending),
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    {
      field: "lastVisit",
      headerName: "Last Visit",
      flex: 1,
      minWidth: 120,
      valueGetter: () => "—",
    },
  ]
}

function vehicleColumns(): GridColDef[] {
  return [
    {
      field: "licensePlate",
      headerName: "License Plate",
      flex: 1,
      minWidth: 130,
    },
    { field: "brand", headerName: "Brand", flex: 1, minWidth: 110 },
    { field: "model", headerName: "Model", flex: 1, minWidth: 110 },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
      minWidth: 130,
      valueGetter: () => "—",
    },
    {
      field: "totalBookings",
      headerName: "Total Bookings",
      flex: 0.8,
      minWidth: 130,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.totalBookings),
    },
    {
      field: "totalSpending",
      headerName: "Total Spending",
      flex: 1,
      minWidth: 130,
      align: "right",
      headerAlign: "right",
      valueGetter: (_v, row) => asNumber(row.totalSpending),
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
  ]
}

function columnsForTab(tab: ReportTab): GridColDef[] {
  switch (tab) {
    case "booking":
      return bookingColumns()
    case "billing":
      return billingColumns()
    case "settlement":
      return settlementColumns()
    case "customer":
      return customerColumns()
    case "vehicle":
      return vehicleColumns()
  }
}

function rowsForTab(tab: ReportTab, data: ReportRows) {
  return data[tab].map((row, index) => ({
    id: `${tab}-${String(
      row.bookingNumber ??
        row.billingId ??
        row.customerId ??
        row.vehicleId ??
        "row",
    )}-${index}`,
    ...row,
  }))
}

export function AdminReportsWorkspace({
  initialTab,
  filters,
  serviceStores,
  branches,
  reportData,
}: AdminReportsWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = React.useState<ReportTab>(initialTab)
  const [from, setFrom] = React.useState(filters.from ?? "")
  const [to, setTo] = React.useState(filters.to ?? "")
  const [serviceStoreId, setServiceStoreId] = React.useState(
    filters.serviceStoreId ?? "",
  )
  const [branchId, setBranchId] = React.useState(filters.branchId ?? "")
  const [bookingStatus, setBookingStatus] = React.useState(
    filters.bookingStatus ?? "",
  )
  const [search, setSearch] = React.useState("")
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  })

  React.useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  React.useEffect(() => {
    setFrom(filters.from ?? "")
    setTo(filters.to ?? "")
    setServiceStoreId(filters.serviceStoreId ?? "")
    setBranchId(filters.branchId ?? "")
    setBookingStatus(filters.bookingStatus ?? "")
  }, [filters])

  const filteredBranches = React.useMemo(() => {
    if (!serviceStoreId) return branches
    return branches.filter(
      (branch) =>
        !branch.serviceStoreId || branch.serviceStoreId === serviceStoreId,
    )
  }, [branches, serviceStoreId])

  const activeFilters = React.useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      serviceStoreId: serviceStoreId || undefined,
      branchId: branchId || undefined,
      bookingStatus: bookingStatus || undefined,
    }),
    [from, to, serviceStoreId, branchId, bookingStatus],
  )

  const replaceQuery = React.useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      router.replace(`/admin/reports?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleTabChange = (_: React.SyntheticEvent, value: ReportTab) => {
    setTab(value)
    setSearch("")
    setFilterModel({ items: [], quickFilterValues: [] })
    replaceQuery({ tab: value })
  }

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    replaceQuery({
      tab,
      from: from || undefined,
      to: to || undefined,
      serviceStoreId: serviceStoreId || undefined,
      branchId: branchId || undefined,
      bookingStatus: bookingStatus || undefined,
    })
  }

  const handleReset = () => {
    setFrom("")
    setTo("")
    setServiceStoreId("")
    setBranchId("")
    setBookingStatus("")
    replaceQuery({
      tab,
      from: undefined,
      to: undefined,
      serviceStoreId: undefined,
      branchId: undefined,
      bookingStatus: undefined,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setFilterModel({
      items: [],
      quickFilterValues: value.trim() ? value.trim().split(/\s+/) : [],
    })
  }

  const rows = rowsForTab(tab, reportData)
  const columns = columnsForTab(tab)
  const showBookingStatus =
    tab === "booking" || tab === "customer" || tab === "vehicle"
  const activeLabel =
    REPORT_TABS.find((item) => item.value === tab)?.label ?? "Booking"

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <form onSubmit={handleApplyFilters}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Filters
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              useFlexGap
              sx={{ flexWrap: "wrap", alignItems: { md: "flex-end" } }}
            >
              <TextField
                type="date"
                size="small"
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { md: 150 }, flex: 1 }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { md: 150 }, flex: 1 }}
              />
              <TextField
                select
                size="small"
                label="Service Store"
                value={serviceStoreId}
                onChange={(e) => {
                  setServiceStoreId(e.target.value)
                  setBranchId("")
                }}
                sx={{ minWidth: { md: 180 }, flex: 1 }}
              >
                <MenuItem value="">All Service Stores</MenuItem>
                {serviceStores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Branch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                sx={{ minWidth: { md: 160 }, flex: 1 }}
              >
                <MenuItem value="">All branches</MenuItem>
                {filteredBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              {showBookingStatus ? (
                <TextField
                  select
                  size="small"
                  label="Booking Status"
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                  sx={{ minWidth: { md: 160 }, flex: 1 }}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  {BOOKING_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}
              <Stack direction="row" spacing={1}>
                <Button type="submit" size="small" variant="contained">
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          minHeight: 48,
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { height: 3 },
            "& .MuiTab-root": { minHeight: 40, px: 2, fontWeight: 600 },
          }}
        >
          {REPORT_TABS.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={`${item.label} (${reportData[item.value].length})`}
            />
          ))}
        </Tabs>
      </Paper>

      <Paper variant="outlined">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          useFlexGap
          sx={{
            px: 1.5,
            py: 1.25,
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            flexWrap: "wrap",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { sm: "center" }, flex: 1 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {activeLabel} report
            </Typography>
            <TextField
              size="small"
              placeholder="Search…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{ width: { xs: "100%", sm: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
            <Button
              size="small"
              variant="outlined"
              href={buildExportLink(tab, "csv", activeFilters)}
            >
              Export CSV
            </Button>
            <Button
              size="small"
              variant="contained"
              href={buildExportLink(tab, "excel", activeFilters)}
            >
              Export Excel
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ height: 520, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
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
                    No records for this report with the current filters.
                  </Typography>
                </Stack>
              ),
            }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
            }}
          />
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary">
        Showing {rows.length.toLocaleString()} row
        {rows.length === 1 ? "" : "s"} · exports use the currently selected
        report and filters.
      </Typography>
    </Stack>
  )
}
