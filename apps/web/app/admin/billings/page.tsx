import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination"
import { AdminListToolbar } from "@/components/admin/ui/admin-list-toolbar"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { AdminBillingGenerationForm } from "@/components/billing/admin-billing-generation-form"
import {
  formatBillingCurrency,
  formatBillingDate,
} from "@/lib/billing/format"
import {
  billingStatusLabel,
  getAdminBillingsForReviewPaginated,
} from "@/lib/billing/queries"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getPlatformSettings } from "@/lib/platform-settings/queries"
import type { BillingStatus } from "@/lib/generated/prisma/client"
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params"
import { prisma } from "@/lib/prisma"

function getDefaultPreviousMonthPeriod() {
  const now = new Date()
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(firstOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000)
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1)
  return { periodStart, periodEnd }
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    serviceStoreId?: string
    sort?: string
    page?: string
    pageSize?: string
  }>
}

export default async function AdminBillingsPage({ searchParams }: PageProps) {
  await requireAdminSession()
  const params = await searchParams
  const { page, pageSize } = parseListPaging(params)
  const sort = parseSortOrder(params.sort)
  const [listResult, platformSettings, serviceStores] = await Promise.all([
    getAdminBillingsForReviewPaginated({
      q: params.q,
      status: params.status as BillingStatus | undefined,
      serviceStoreId: params.serviceStoreId,
      page,
      pageSize,
      sort,
    }),
    getPlatformSettings(),
    prisma.serviceStore.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])
  const { periodStart, periodEnd } = getDefaultPreviousMonthPeriod()

  return (
    <AdminLayout
      title="Billing review"
      description="Generate billing batches and review store payment submissions."
    >
      <AdminBillingGenerationForm
        defaultPeriodStart={toDateInputValue(periodStart)}
        defaultPeriodEnd={toDateInputValue(periodEnd)}
        bookingFee={platformSettings.bookingFee.toString()}
        vatRate={platformSettings.vatRate.toString()}
        currency={platformSettings.currency}
      />

      <Stack spacing={2}>
        <Typography variant="h4" component="h2">
          Needs review
        </Typography>
        <AdminListToolbar
          searchPlaceholder="Search Service Store code or invoice"
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                "PENDING",
                "PAYMENT_SUBMITTED",
                "PAID",
                "REJECTED",
                "CANCELLED",
              ].map((status) => ({
                value: status,
                label: billingStatusLabel(status as BillingStatus),
              })),
            },
            {
              key: "serviceStoreId",
              label: "Service Store",
              options: serviceStores.map((serviceStore) => ({
                value: serviceStore.id,
                label: serviceStore.name,
              })),
            },
          ]}
        />
        <AdminSectionCard>
          {listResult.rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No billings pending review.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service Store</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listResult.rows.map((billing) => (
                    <TableRow key={billing.id} hover>
                      <TableCell>{billing.serviceStore.name}</TableCell>
                      <TableCell>
                        {formatBillingDate(billing.periodStart)} -{" "}
                        {formatBillingDate(billing.periodEnd)}
                      </TableCell>
                      <TableCell>
                        <AdminStatusChip
                          label={billingStatusLabel(billing.status)}
                          status={billing.status}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatBillingCurrency(billing.total)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          href={`/admin/billings/${billing.id}`}
                          size="small"
                          variant="text"
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AdminSectionCard>
        <AdminListPagination
          page={page}
          pageSize={pageSize}
          totalCount={listResult.totalCount}
          searchParams={params}
        />
      </Stack>
    </AdminLayout>
  )
}
