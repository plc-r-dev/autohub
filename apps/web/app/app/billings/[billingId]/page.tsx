import { notFound } from "next/navigation";
import { ServiceStorePaymentSlipForm } from "@/components/billing/service-store-payment-slip-form";
import { ServiceStoreSubmitBillingButton } from "@/components/billing/service-store-submit-billing-button";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreCard, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import {
  billingPaymentReviewStatusLabel,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
} from "@/lib/billing/format";
import { billingStatusLabel, getServiceStoreBilling } from "@/lib/billing/queries";

type PageProps = {
  params: Promise<{ billingId: string }>;
};

export default async function ServiceStoreBillingDetailPage({ params }: PageProps) {
  const { billingId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const billing = await getServiceStoreBilling(billingId, serviceStore.id);

  if (!billing) {
    notFound();
  }

  return (
    <PageShell
      title="Billing detail"
      description={`${formatBillingDate(billing.periodStart)} – ${formatBillingDate(billing.periodEnd)}`}
      nav={serviceStoreNav}
      backHref="/app/billings"
      backLabel="Billings"
    >
      <ServiceStoreCard className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#15202b]">Summary</h2>
          <ServiceStoreStatusBadge
            label={billingStatusLabel(billing.status)}
            status={billing.status}
          />
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#8a97a5]">Completed bookings</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{billing.bookingCount}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Booking fee</dt>
            <dd className="mt-1 font-medium text-[#15202b]">
              {formatBillingCurrency(billing.bookingFee)}
            </dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">VAT rate</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{billing.vatRate.toString()}%</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Subtotal</dt>
            <dd className="mt-1 font-medium text-[#15202b]">
              {formatBillingCurrency(billing.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">VAT</dt>
            <dd className="mt-1 font-medium text-[#15202b]">
              {formatBillingCurrency(billing.vat)}
            </dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Discount</dt>
            <dd className="mt-1 font-medium text-[#15202b]">
              {formatBillingCurrency(billing.discount)}
            </dd>
          </div>
          {billing.invoiceNumber ? (
            <div>
              <dt className="text-[#8a97a5]">Invoice</dt>
              <dd className="mt-1 font-medium text-[#15202b]">{billing.invoiceNumber}</dd>
            </div>
          ) : null}
          {billing.receiptNumber ? (
            <div>
              <dt className="text-[#8a97a5]">Receipt</dt>
              <dd className="mt-1 font-medium text-[#15202b]">{billing.receiptNumber}</dd>
            </div>
          ) : null}
        </dl>

        <div className="flex justify-between border-t border-[#eef3f7] pt-4 text-base font-semibold">
          <span className="text-[#15202b]">Total</span>
          <span className="text-[#0F9B76]">{formatBillingCurrency(billing.total)}</span>
        </div>

        {billing.rejectReason ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Reject reason: {billing.rejectReason}
          </p>
        ) : null}
      </ServiceStoreCard>

      <ServiceStoreSubmitBillingButton billingId={billing.id} status={billing.status} />

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Billing items</h2>
        {billing.items.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No billable items.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {billing.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#eef3f7] p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#15202b]">{item.bookingNumber}</p>
                  <p className="text-[#8a97a5]">{formatBillingDate(item.bookingDate)}</p>
                </div>
                <p className="font-semibold text-[#15202b]">{formatBillingCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Upload payment slip</h2>
        <div className="mt-4">
          <ServiceStorePaymentSlipForm
            billingId={billing.id}
            canUpload={["APPROVED", "PAYMENT_REJECTED"].includes(billing.status)}
          />
        </div>
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Payment history</h2>
        {billing.payments.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No payment submissions yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {billing.payments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-[#eef3f7] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#15202b]">
                    {formatBillingDate(payment.paymentDate)} ·{" "}
                    {formatBillingCurrency(payment.amount)}
                  </p>
                  <ServiceStoreStatusBadge
                    label={billingPaymentReviewStatusLabel(payment.reviewStatus)}
                    status={payment.reviewStatus}
                  />
                </div>
                <p className="mt-1 text-[#8a97a5]">
                  {payment.bank}
                  {payment.referenceNumber ? ` · ${payment.referenceNumber}` : ""}
                </p>
                <p className="text-xs text-[#8a97a5]">
                  Submitted {formatBillingDateTime(payment.submittedAt)}
                </p>
                {payment.rejectReason ? (
                  <p className="mt-2 rounded-lg bg-red-50 p-2 text-red-700">
                    Reject reason: {payment.rejectReason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </ServiceStoreCard>
    </PageShell>
  );
}
