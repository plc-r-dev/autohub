import { notFound } from "next/navigation";
import { MerchantPaymentSlipForm } from "@/components/billing/merchant-payment-slip-form";
import { MerchantSubmitBillingButton } from "@/components/billing/merchant-submit-billing-button";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import {
  billingPaymentReviewStatusLabel,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
} from "@/lib/billing/format";
import { billingStatusLabel, getMerchantBilling } from "@/lib/billing/queries";

type PageProps = {
  params: Promise<{ billingId: string }>;
};

export default async function MerchantBillingDetailPage({ params }: PageProps) {
  const { billingId } = await params;
  const { merchant } = await requireApprovedMerchantUser();
  const billing = await getMerchantBilling(billingId, merchant.id);

  if (!billing) {
    notFound();
  }

  return (
    <PageShell
      title="Billing detail"
      description={`${formatBillingDate(billing.periodStart)} - ${formatBillingDate(billing.periodEnd)}`}
      nav={merchantNav}
      backHref="/merchant/billings"
    >
      <div className="border-input flex flex-col gap-3 rounded-md border p-4 text-sm">
        <p>Status: {billingStatusLabel(billing.status)}</p>
        <p>Completed bookings: {billing.bookingCount}</p>
        <p>Booking fee: {formatBillingCurrency(billing.bookingFee)}</p>
        <p>VAT rate: {billing.vatRate.toString()}%</p>
        <p>Subtotal: {formatBillingCurrency(billing.subtotal)}</p>
        <p>VAT: {formatBillingCurrency(billing.vat)}</p>
        <p>Discount: {formatBillingCurrency(billing.discount)}</p>
        <p className="font-medium">Total: {formatBillingCurrency(billing.total)}</p>
        {billing.invoiceNumber ? <p>Invoice: {billing.invoiceNumber}</p> : null}
        {billing.receiptNumber ? <p>Receipt: {billing.receiptNumber}</p> : null}
        {billing.rejectReason ? (
          <p className="text-destructive">Reject reason: {billing.rejectReason}</p>
        ) : null}
      </div>

      <MerchantSubmitBillingButton billingId={billing.id} status={billing.status} />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Billing items</h2>
        {billing.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No billable items.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {billing.items.map((item) => (
              <div
                key={item.id}
                className="border-input flex items-center justify-between gap-4 rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.bookingNumber}</p>
                  <p className="text-muted-foreground">
                    {formatBillingDate(item.bookingDate)}
                  </p>
                </div>
                <p>{formatBillingCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Upload payment slip</h2>
        <MerchantPaymentSlipForm
          billingId={billing.id}
          canUpload={["APPROVED", "PAYMENT_REJECTED"].includes(billing.status)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Payment history</h2>
        {billing.payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payment submissions yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {billing.payments.map((payment) => (
              <div key={payment.id} className="border-input rounded-md border p-3 text-sm">
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
                  {billingPaymentReviewStatusLabel(payment.reviewStatus)}
                </p>
                {payment.rejectReason ? (
                  <p className="text-destructive">Reject reason: {payment.rejectReason}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
