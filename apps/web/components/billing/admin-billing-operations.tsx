"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { AdminPaymentReviewActions } from "@/components/billing/admin-payment-review-actions"
import { PaymentSlipPreview } from "@/components/billing/payment-slip-preview"
import {
  estimateBillingGeneration,
  generateMonthlyBilling,
  getAdminBillingDrawerPayload,
  type AdminBillingDrawerPayload,
  type BillingActionState,
} from "@/lib/billing/actions"
import {
  billingStatusLabel,
  formatBillingCurrency,
  formatBillingDateTime,
  formatBillingPeriod,
} from "@/lib/billing/format"
import type { BillingStatus } from "@/lib/generated/prisma/client"

type TabValue = "payments" | "history"

type BillingKpis = {
  pendingPayments: number
  generatedThisMonth: number
  outstandingAmount: number
  paidAmount: number
}

type GenerationEstimate = {
  estimatedStores: number
  estimatedBookings: number
  estimatedRevenue: number
}

type PaymentReviewRow = {
  id: string
  storeName: string
  storeCode: string
  invoiceNumber: string | null
  periodLabel: string
  periodKey: string
  amount: number
  submittedAt: string | null
  status: BillingStatus
  bookingCount: number
}

type HistoryBatch = {
  periodKey: string
  periodStart: string
  periodEnd: string
  storeCount: number
  totalAmount: number
  status: "Complete" | "Partial" | "Open" | "Needs review"
}

type AdminBillingOperationsProps = {
  kpis: BillingKpis
  defaultPeriodStart: string
  defaultPeriodEnd: string
  bookingFee: string
  vatRate: string
  currency: string
  initialEstimate: GenerationEstimate
  paymentRows: PaymentReviewRow[]
  historyBatches: HistoryBatch[]
  initialBillingId?: string
  initialTab?: TabValue
}

const initialState: BillingActionState = {}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  )
}

export function AdminBillingOperations({
  kpis,
  defaultPeriodStart,
  defaultPeriodEnd,
  bookingFee,
  vatRate,
  currency,
  initialEstimate,
  paymentRows,
  historyBatches,
  initialBillingId,
  initialTab = "payments",
}: AdminBillingOperationsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = React.useState<TabValue>(initialTab)
  const [estimate, setEstimate] =
    React.useState<GenerationEstimate>(initialEstimate)
  const [periodStart, setPeriodStart] = React.useState(defaultPeriodStart)
  const [periodEnd, setPeriodEnd] = React.useState(defaultPeriodEnd)
  const [estimating, setEstimating] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(Boolean(initialBillingId))
  const [drawerLoading, setDrawerLoading] = React.useState(false)
  const [drawerPayload, setDrawerPayload] =
    React.useState<AdminBillingDrawerPayload | null>(null)
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [genState, formAction, isGenerating] = useActionState(
    generateMonthlyBilling,
    initialState,
  )

  const openReview = React.useCallback(
    async (billingId: string) => {
      setDrawerOpen(true)
      setDrawerLoading(true)
      setDrawerPayload(null)
      const payload = await getAdminBillingDrawerPayload(billingId)
      setDrawerPayload(payload)
      setDrawerLoading(false)

      const next = new URLSearchParams(searchParams.toString())
      next.set("billingId", billingId)
      router.replace(`/admin/billings/payment-review?${next.toString()}`, {
        scroll: false,
      })
    },
    [router, searchParams],
  )

  const closeDrawer = React.useCallback(() => {
    setDrawerOpen(false)
    setDrawerPayload(null)
    const next = new URLSearchParams(searchParams.toString())
    next.delete("billingId")
    const path =
      tab === "history"
        ? "/admin/billings/history"
        : "/admin/billings/payment-review"
    const qs = next.toString()
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false })
  }, [router, searchParams, tab])

  React.useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  React.useEffect(() => {
    if (!initialBillingId) return
    void openReview(initialBillingId)
    // Deep-link open on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshEstimate = React.useCallback(
    async (start: string, end: string) => {
      setEstimating(true)
      const next = await estimateBillingGeneration(start, end)
      if (next) setEstimate(next)
      setEstimating(false)
    },
    [],
  )

  const periodFilter = searchParams.get("period")
  const displayPaymentRows = React.useMemo(() => {
    if (periodFilter) {
      return paymentRows.filter((row) => row.periodKey === periodFilter)
    }
    return paymentRows.filter((row) => row.status === "PAYMENT_SUBMITTED")
  }, [paymentRows, periodFilter])

  const paymentColumns: GridColDef<PaymentReviewRow>[] = [
    {
      field: "storeName",
      headerName: "Store",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_value, row) => `${row.storeName} (${row.storeCode})`,
    },
    {
      field: "invoiceNumber",
      headerName: "Billing Number",
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) => row.invoiceNumber ?? "—",
    },
    {
      field: "periodLabel",
      headerName: "Billing Period",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 0.8,
      minWidth: 110,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    {
      field: "submittedAt",
      headerName: "Submitted At",
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) =>
        row.submittedAt ? formatBillingDateTime(row.submittedAt) : "—",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <AdminStatusChip
          label={billingStatusLabel(params.row.status)}
          status={params.row.status}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 110,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => void openReview(params.row.id)}
        >
          Review
        </Button>
      ),
    },
  ]

  const historyColumns: GridColDef<HistoryBatch & { id: string }>[] = [
    {
      field: "periodKey",
      headerName: "Month",
      flex: 1,
      minWidth: 120,
      valueGetter: (_value, row) => formatBillingPeriod(row.periodStart),
    },
    {
      field: "storeCount",
      headerName: "Store Count",
      flex: 0.8,
      minWidth: 110,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => formatBillingCurrency(value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Chip size="small" label={params.row.status} variant="outlined" />
      ),
    },
    {
      field: "view",
      headerName: "View",
      sortable: false,
      filterable: false,
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Button
          size="small"
          variant="text"
          onClick={() => {
            router.push(
              `/admin/billings/payment-review?period=${params.row.periodKey}`,
            )
          }}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Typography variant="body2" color="text.secondary">
          {tab === "history"
            ? "Previously generated billing batches."
            : "Review store payment submissions."}
        </Typography>
        {tab === "payments" ? (
          <Button
            size="small"
            variant="contained"
            onClick={() => setGenerateOpen(true)}
          >
            Generate billing
          </Button>
        ) : null}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminStatCard
            label="Pending Payments"
            value={kpis.pendingPayments}
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminStatCard
            label="Generated This Month"
            value={kpis.generatedThisMonth}
            tone="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminStatCard
            label="Outstanding Amount"
            value={formatBillingCurrency(kpis.outstandingAmount)}
            tone="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminStatCard
            label="Paid Amount"
            value={formatBillingCurrency(kpis.paidAmount)}
            tone="primary"
          />
        </Grid>
      </Grid>

      {tab === "payments" ? (
        <Stack spacing={1}>
          {periodFilter ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip
                size="small"
                label={`Period ${periodFilter}`}
                onDelete={() => {
                  router.replace("/admin/billings/payment-review", {
                    scroll: false,
                  })
                }}
              />
            </Stack>
          ) : null}
          <Paper variant="outlined" sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={displayPaymentRows}
              columns={paymentColumns}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "action.hover",
                },
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
                      {periodFilter
                        ? "No billings for this period."
                        : "No payment submissions awaiting review."}
                    </Typography>
                  </Stack>
                ),
              }}
            />
          </Paper>
        </Stack>
      ) : null}

      {tab === "history" ? (
        <Paper variant="outlined" sx={{ height: 480, width: "100%" }}>
          <DataGrid
            rows={historyBatches.map((batch) => ({
              ...batch,
              id: `${batch.periodStart}|${batch.periodEnd}`,
            }))}
            columns={historyColumns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "action.hover",
              },
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
                    No billing batches generated yet.
                  </Typography>
                </Stack>
              ),
            }}
          />
        </Paper>
      ) : null}

      <Dialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Generate billing batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {genState.error ? (
              <Alert severity="error">{genState.error}</Alert>
            ) : null}
            {genState.success ? (
              <Alert severity="success">{genState.success}</Alert>
            ) : null}
            <form id="generate-billing-form" action={formAction}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  id="periodStart"
                  name="periodStart"
                  label="Period start"
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => {
                    const value = e.target.value
                    setPeriodStart(value)
                    void refreshEstimate(value, periodEnd)
                  }}
                  error={Boolean(genState.fieldErrors?.periodStart?.[0])}
                  helperText={genState.fieldErrors?.periodStart?.[0]}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  id="periodEnd"
                  name="periodEnd"
                  label="Period end"
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => {
                    const value = e.target.value
                    setPeriodEnd(value)
                    void refreshEstimate(periodStart, value)
                  }}
                  error={Boolean(genState.fieldErrors?.periodEnd?.[0])}
                  helperText={genState.fieldErrors?.periodEnd?.[0]}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Meta
                      label="Booking Fee"
                      value={`${bookingFee} ${currency}`}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta label="VAT" value={`${vatRate}%`} />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="Estimated Stores"
                      value={estimating ? "…" : estimate.estimatedStores}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="Estimated Revenue"
                      value={
                        estimating
                          ? "…"
                          : formatBillingCurrency(estimate.estimatedRevenue)
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </form>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGenerateOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="generate-billing-form"
            variant="contained"
            disabled={isGenerating || estimate.estimatedStores === 0}
          >
            {isGenerating ? "Generating…" : "Generate Billing"}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: { width: { xs: "100%", sm: 420, md: 480 }, p: 0 },
          },
        }}
      >
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment review
            </Typography>
            <Button size="small" onClick={closeDrawer}>
              Close
            </Button>
          </Stack>

          <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
            {drawerLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading…
              </Typography>
            ) : null}
            {!drawerLoading && !drawerPayload ? (
              <Alert severity="error">Billing not found.</Alert>
            ) : null}
            {drawerPayload ? (
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Billing Summary
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {drawerPayload.storeName}
                  </Typography>
                  <AdminStatusChip
                    label={billingStatusLabel(
                      drawerPayload.status as BillingStatus,
                    )}
                    status={drawerPayload.status}
                  />
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <Meta
                      label="Billing Number"
                      value={drawerPayload.invoiceNumber ?? "—"}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta label="Period" value={drawerPayload.periodLabel} />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="Booking Count"
                      value={drawerPayload.bookingCount}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="Total"
                      value={formatBillingCurrency(drawerPayload.total)}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="Booking Fee"
                      value={formatBillingCurrency(drawerPayload.bookingFee)}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Meta
                      label="VAT"
                      value={`${formatBillingCurrency(drawerPayload.vat)} (${drawerPayload.vatRate}%)`}
                    />
                  </Grid>
                </Grid>

                {drawerPayload.rejectReason ? (
                  <Alert severity="error">
                    Rejection reason: {drawerPayload.rejectReason}
                  </Alert>
                ) : null}

                <Divider />

                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Slip
                  </Typography>
                  {drawerPayload.payment ? (
                    <>
                      <Meta
                        label="Submitted"
                        value={formatBillingDateTime(
                          drawerPayload.payment.submittedAt,
                        )}
                      />
                      {drawerPayload.payment.referenceNumber ? (
                        <Meta
                          label="Reference"
                          value={drawerPayload.payment.referenceNumber}
                        />
                      ) : null}
                      <PaymentSlipPreview
                        previewUrl={drawerPayload.payment.previewUrl}
                        fileName={drawerPayload.payment.fileName}
                        mimeType={drawerPayload.payment.mimeType}
                      />
                      <AdminPaymentReviewActions
                        billingId={drawerPayload.id}
                        paymentId={drawerPayload.payment.id}
                        reviewStatus={drawerPayload.payment.reviewStatus}
                        billingStatus={drawerPayload.status}
                      />
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No payment slip submitted.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Drawer>
    </Stack>
  )
}
