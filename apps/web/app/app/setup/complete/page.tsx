import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { ServiceStoreButton, ServiceStoreCard } from "@/components/service-store/ui";
import { getOnboardingSetupProgress } from "@/lib/service-store/application/onboarding-setup-queries";
import { completeOnboardingSetup } from "@/lib/service-store/setup-actions";
import { requireServiceStoreContext } from "@/lib/service-store/context";

export default async function ServiceStoreSetupCompletePage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);

  if (!progress) {
    redirect("/app");
  }

  if (ctx.serviceStore.status === "READY_FOR_BOOKING") {
    redirect("/app/dashboard");
  }

  return (
    <ServiceStorePublicLayout
      title="Finish setup"
      description="Review your progress and activate online booking."
      backHref="/app/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreCard className="space-y-4">
          {progress.isComplete ? (
            <>
              <p className="text-sm text-[#5b6b7a]">
                All required steps are complete. Your Service Store will be marked{" "}
                <strong>Ready for booking</strong> and appear on the customer marketplace.
              </p>
              <form action={completeOnboardingSetup}>
                <ServiceStoreButton type="submit">Activate online booking</ServiceStoreButton>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5b6b7a]">
                Complete the remaining required steps before activating online booking.
              </p>
              <p className="text-sm text-amber-700">
                {progress.requiredTotalCount - progress.requiredMetCount} required step(s) remaining.
              </p>
            </>
          )}
        </ServiceStoreCard>
        <ServiceStoreSetupProgress progress={progress} />
      </div>
    </ServiceStorePublicLayout>
  );
}
