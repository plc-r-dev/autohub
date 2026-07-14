import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreSetupPaymentForm } from "@/components/service-store/setup/service-store-setup-payment-form";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { getOnboardingSetupProgress } from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";

export default async function ServiceStoreSetupPaymentPage() {
  const ctx = await requireServiceStoreContext(undefined, { allowOnboarding: true });
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);

  if (!progress) {
    redirect("/app");
  }

  return (
    <ServiceStorePublicLayout
      title="Configure payment account"
      description="Add the bank account where AutoHub should send your payouts."
      backHref="/app/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreSetupPaymentForm
          defaultValues={{
            payoutBankName: ctx.serviceStore.payoutBankName ?? "",
            payoutAccountName: ctx.serviceStore.payoutAccountName ?? "",
            payoutAccountNumber: ctx.serviceStore.payoutAccountNumber ?? "",
            payoutBankBranch: ctx.serviceStore.payoutBankBranch ?? "",
          }}
        />
        <ServiceStoreSetupProgress progress={progress} currentStep="payment" />
      </div>
    </ServiceStorePublicLayout>
  );
}
