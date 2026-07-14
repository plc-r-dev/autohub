import { notFound } from "next/navigation"
import Alert from "@mui/material/Alert"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { AdminPaymentReviewActions } from "@/components/billing/admin-payment-review-actions"
import { PaymentSlipPreview } from "@/components/billing/payment-slip-preview"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { canReviewBillingPayment } from "@/lib/billing/domain"
import {
  billingPaymentReviewStatusLabel,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
} from "@/lib/billing/format"
import { billingStatusLabel, getAdminBillingDetail } from "@/lib/billing/queries"
import { getPaymentSlipPreviewUrl } from "@/lib/storage/upload-service"

type PageProps = {
  params: Promise<{ billingId: string }>
}

function Meta({ label, value }: { label: string; value: string }) {
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

export default async function AdminBillingDetailPage({ params }: PageProps) {
  await requireAdminSession()
  const { billingId } = await params
  const billing = await getAdminBillingDetail(billingId)

  if (!billing) {
    notFound()
  }

  const paymentPreviews = await Promise.all(
    billing.payments.map(async (payment) => ({
      paymentId: payment.id,
      previewUrl: await getPaymentSlipPreviewUrl(payment.slipKey),
    })),
  )
  const previewByPaymentId = new Map(
    paymentPreviews.map((preview) => [preview.paymentId, preview.previewUrl]),
  )

  const latestPendingPayment = billing.payments.find(
    (payment) =>
      payment.reviewStatus === "PENDING" &&
      canReviewBillingPayment(billing.status),
  )

  return (
    <AdminLayout
      title="Billing detail"
      description={`${billing.serviceStore.name} · ${formatBillingDate(billing.periodStart)} - ${formatBillingDate(billing.periodEnd)}`}
    >
      <AdminSectionCard
        title="Billing summary"
        action={
          <AdminStatusChip
            label={billingStatusLabel(billing.status)}
            status={billing.status}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Meta label="Service store" value={billing.serviceStore.name} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Meta label="Bookings" value={String(billing.bookingCount)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Meta
              label="Booking fee"
              value={formatBillingCurrency(billing.bookingFee)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Meta
              label="VAT"
              value={`${formatBillingCurrency(billing.vat)} (${billing.vatRate.toString()}%)`}
            />
          </Grid>
          {billing.invoiceNumber ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Meta label="Invoice" value={billing.invoiceNumber} />
            </Grid>
          ) : null}
          {billing.receiptNumber ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Meta label="Receipt" value={billing.receiptNumber} />
            </Grid>
          ) : null}
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatBillingCurrency(billing.total)}
          </Typography>
        </Stack>
        {billing.rejectReason ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Rejection reason: {billing.rejectReason}
          </Alert>
        ) : null}
      </AdminSectionCard>

      <AdminSectionCard title="Billing items">
        {billing.items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No billing items.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {billing.items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.bookingNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatBillingDate(item.bookingDate)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatBillingCurrency(item.amount)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </AdminSectionCard>

      <AdminSectionCard title="Payment review">
        {billing.payments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No payment submissions yet. Waiting for the store to pay.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {billing.payments.map((payment) => {
              const isLatestReviewTarget =
                latestPendingPayment?.id === payment.id
              return (
                <Stack
                  key={payment.id}
                  spacing={1.5}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                    useFlexGap
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatBillingDate(payment.paymentDate)} ·{" "}
                      {formatBillingCurrency(payment.amount)}
                    </Typography>
                    <AdminStatusChip
                      label={billingPaymentReviewStatusLabel(
                        payment.reviewStatus,
                      )}
                      status={payment.reviewStatus}
                    />
                  </Stack>
                  {payment.referenceNumber ? (
                    <Typography variant="body2" color="text.secondary">
                      Reference: {payment.referenceNumber}
                    </Typography>
                  ) : null}
                  <Typography variant="body2" color="text.secondary">
                    Submitted {formatBillingDateTime(payment.submittedAt)} ·{" "}
                    {payment.fileName}
                  </Typography>
                  {payment.rejectReason ? (
                    <Alert severity="error">
                      Reject reason: {payment.rejectReason}
                    </Alert>
                  ) : null}
                  <PaymentSlipPreview
                    previewUrl={previewByPaymentId.get(payment.id) ?? ""}
                    fileName={payment.fileName}
                    mimeType={payment.mimeType}
                  />
                  {isLatestReviewTarget ? (
                    <AdminPaymentReviewActions
                      billingId={billing.id}
                      paymentId={payment.id}
                      reviewStatus={payment.reviewStatus}
                      billingStatus={billing.status}
                    />
                  ) : null}
                </Stack>
              )
            })}
          </Stack>
        )}
      </AdminSectionCard>
    </AdminLayout>
  )
}
