import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { formatBillingCurrency, formatBillingDate } from "@/lib/billing/format"
import { getReportData } from "@/lib/reporting/queries"
import { prisma } from "@/lib/prisma"

type PageProps = {
  searchParams: Promise<{
    from?: string
    to?: string
    serviceStoreId?: string
    branchId?: string
    bookingStatus?: string
  }>
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function buildExportLink(
  reportType: string,
  format: "csv" | "excel",
  params: Record<string, string | undefined>,
): string {
  const query = new URLSearchParams()
  query.set("type", reportType)
  query.set("format", format)
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  return `/admin/reports/export?${query.toString()}`
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireAdminSession()
  const params = await searchParams

  const filters = {
    from: parseDate(params.from),
    to: parseDate(params.to),
    serviceStoreId: params.serviceStoreId,
    branchId: params.branchId,
    bookingStatus: params.bookingStatus,
  }

  const [reportData, serviceStores, branches] = await Promise.all([
    getReportData(filters),
    prisma.serviceStore.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <AdminLayout
      title="Reports"
      description="Export booking, billing, settlement, customer, and vehicle reports."
    >
      <AdminSectionCard title="Filters">
        <form>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <TextField
                type="date"
                name="from"
                label="From"
                defaultValue={params.from}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { md: 160 }, flex: 1 }}
              />
              <TextField
                type="date"
                name="to"
                label="To"
                defaultValue={params.to}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { md: 160 }, flex: 1 }}
              />
              <TextField
                select
                name="serviceStoreId"
                label="Service Store"
                defaultValue={params.serviceStoreId ?? ""}
                sx={{ minWidth: { md: 180 }, flex: 1 }}
              >
                <MenuItem value="">All Service Stores</MenuItem>
                {serviceStores.map((serviceStore) => (
                  <MenuItem key={serviceStore.id} value={serviceStore.id}>
                    {serviceStore.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="branchId"
                label="Branch"
                defaultValue={params.branchId ?? ""}
                sx={{ minWidth: { md: 160 }, flex: 1 }}
              >
                <MenuItem value="">All branches</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="bookingStatus"
                label="Booking status"
                defaultValue={params.bookingStatus ?? ""}
                sx={{ minWidth: { md: 160 }, flex: 1 }}
              >
                <MenuItem value="">All statuses</MenuItem>
                {[
                  "PENDING",
                  "CONFIRMED",
                  "IN_PROGRESS",
                  "COMPLETED",
                  "CANCELLED",
                  "NO_SHOW",
                ].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Apply filters
            </Button>
          </Stack>
        </form>
      </AdminSectionCard>

      {(
        [
          ["booking", "Booking Report"],
          ["billing", "Billing Report"],
          ["settlement", "Settlement Report"],
          ["customer", "Customer Report"],
          ["vehicle", "Vehicle Report"],
        ] as const
      ).map(([type, title]) => {
        const rows = reportData[type]
        const firstRow = rows[0]
        return (
          <AdminSectionCard
            key={type}
            title={title}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  href={buildExportLink(type, "csv", params)}
                  size="small"
                  variant="outlined"
                >
                  Export CSV
                </Button>
                <Button
                  href={buildExportLink(type, "excel", params)}
                  size="small"
                  variant="outlined"
                >
                  Export Excel
                </Button>
              </Stack>
            }
          >
            {rows.length === 0 || !firstRow ? (
              <Typography variant="body2" color="text.secondary">
                No records.
              </Typography>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      {Object.keys(firstRow).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.slice(0, 50).map((row, idx) => (
                      <TableRow key={idx} hover>
                        {Object.entries(row).map(([key, value]) => (
                          <TableCell key={key}>
                            {value instanceof Date
                              ? formatBillingDate(value)
                              : typeof value === "number" &&
                                  (key.toLowerCase().includes("amount") ||
                                    key.toLowerCase().includes("total"))
                                ? formatBillingCurrency(value)
                                : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AdminSectionCard>
        )
      })}
    </AdminLayout>
  )
}
