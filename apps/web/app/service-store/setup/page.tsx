import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import { getOnboardingSetupProgress } from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { ONBOARDING_SETUP_STEP } from "@/lib/service-store/domain";

export default async function ServiceStoreSetupPage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);

  if (!progress) {
    redirect("/service-store/onboarding");
  }

  if (ctx.serviceStore.status === "READY_FOR_BOOKING") {
    redirect("/service-store/dashboard");
  }

  if (progress.isComplete) {
    redirect("/service-store/setup/complete");
  }

  const nextHref =
    progress.steps.find((step) => step.required && !step.met)?.href ??
    "/service-store/setup/verify-business";

  return (
    <ServiceStorePublicLayout
      title="Complete your setup"
      description={`Finish setting up ${ctx.serviceStore.name} before accepting online bookings.`}
      backHref="/service-store/dashboard"
    >
      <div className="flex flex-col gap-6">
        <ServiceStoreCard>
          <p className="text-sm text-[#5b6b7a]">
            Your Service Store is in setup mode. Complete each required step to reach{" "}
            <strong>Ready for booking</strong> status.
          </p>
          <div className="mt-4">
            <ServiceStoreButtonLink href={nextHref}>Continue setup</ServiceStoreButtonLink>
          </div>
        </ServiceStoreCard>
        <ServiceStoreSetupProgress progress={progress} currentStep={progress.nextStep ?? undefined} />
      </div>
    </ServiceStorePublicLayout>
  );
}

export { ONBOARDING_SETUP_STEP };
