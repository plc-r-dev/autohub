import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminBillingReviewActions } from "@/components/billing/admin-billing-review-actions";
import { AdminPaymentReviewActions } from "@/components/billing/admin-payment-review-actions";
import { PaymentSlipPreview } from "@/components/billing/payment-slip-preview";
import { requireAdminSession } from "@/lib/auth/require-admin";
import {
  billingPaymentReviewStatusLabel,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
} from "@/lib/billing/format";
import { billingStatusLabel, getAdminBillingDetail } from "@/lib/billing/queries";
import { getPaymentSlipPreviewUrl } from "@/lib/storage/upload-service";

type PageProps = {
  params: Promise<{ billingId: string }>;
};

export default async function AdminBillingDetailPage({ params }: PageProps) {
  await requireAdminSession();
  const { billingId } = await params;
  const billing = await getAdminBillingDetail(billingId);

  if (!billing) {
    notFound();
  }

  const paymentPreviews = await Promise.all(
    billing.payments.map(async (payment) => ({
      paymentId: payment.id,
      previewUrl: await getPaymentSlipPreviewUrl(payment.slipKey),
    })),
  );
  const previewByPaymentId = new Map(
    paymentPreviews.map((preview) => [preview.paymentId, preview.previewUrl]),
  );

  return (
    <AdminLayout
      title="Billing detail"
      description={`${billing.serviceStore.name} · ${formatBillingDate(billing.periodStart)} - ${formatBillingDate(billing.periodEnd)}`}
    >
      <div className="border-input flex flex-col gap-3 rounded-md border p-4 text-sm">
        <p>Status: {billingStatusLabel(billing.status)}</p>
        <p>Booking count: {billing.bookingCount}</p>
        <p>Booking fee: {formatBillingCurrency(billing.bookingFee)}</p>
        <p>VAT rate: {billing.vatRate.toString()}%</p>
        <p>Subtotal: {formatBillingCurrency(billing.subtotal)}</p>
        <p>VAT: {formatBillingCurrency(billing.vat)}</p>
        <p>Discount: {formatBillingCurrency(billing.discount)}</p>
        <p className="font-medium">Total: {formatBillingCurrency(billing.total)}</p>
        {billing.invoiceNumber ? <p>Invoice number: {billing.invoiceNumber}</p> : null}
        {billing.receiptNumber ? <p>Receipt number: {billing.receiptNumber}</p> : null}
        {billing.rejectReason ? (
          <p className="text-destructive">Reject reason: {billing.rejectReason}</p>
        ) : null}
      </div>

      <AdminBillingReviewActions billingId={billing.id} status={billing.status} />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Billing items</h2>
        {billing.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No billing items.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {billing.items.map((item) => (
              <div key={item.id} className="border-input rounded-md border p-3 text-sm">
                <p className="font-medium">{item.bookingNumber}</p>
                <p className="text-muted-foreground">{formatBillingDate(item.bookingDate)}</p>
                <p>{formatBillingCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Payment submissions</h2>
        {billing.payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payment submissions yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {billing.payments.map((payment) => (
              <article key={payment.id} className="border-input rounded-md border p-4 text-sm">
                <p>
                  {formatBillingDate(payment.paymentDate)} ·{" "}
                  {formatBillingCurrency(payment.amount)}
                </p>
                <p className="text-muted-foreground">
                  {payment.bank}
                  {payment.referenceNumber ? ` · ${payment.referenceNumber}` : ""}
                </p>
                <p className="text-muted-foreground">
                  Submitted {formatBillingDateTime(payment.submittedAt)} ·{" "}
                  {payment.fileName} ({payment.fileSize} bytes)
                </p>
                <p>Status: {billingPaymentReviewStatusLabel(payment.reviewStatus)}</p>
                {payment.rejectReason ? (
                  <p className="text-destructive">Reject reason: {payment.rejectReason}</p>
                ) : null}
                <div className="mt-3">
                  <PaymentSlipPreview
                    previewUrl={previewByPaymentId.get(payment.id) ?? ""}
                    fileName={payment.fileName}
                    mimeType={payment.mimeType}
                  />
                </div>
                <AdminPaymentReviewActions
                  billingId={billing.id}
                  paymentId={payment.id}
                  reviewStatus={payment.reviewStatus}
                  billingStatus={billing.status}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
