import Link from "next/link";
import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import {
  getOnboardingSetupProgress,
  getPrimaryBranchId,
} from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";

export default async function ServiceStoreSetupHoursPage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);
  const branchId = await getPrimaryBranchId(ctx.serviceStore.id);

  if (!progress || !branchId) {
    redirect("/app/setup/verify-business");
  }

  return (
    <ServiceStorePublicLayout
      title="Configure operating hours"
      description="Set when customers can book appointments."
      backHref="/app/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreCard className="space-y-4">
          <p className="text-sm text-[#5b6b7a]">
            Configure opening hours for your primary branch. At least one day must be open.
          </p>
          <div className="flex flex-wrap gap-2">
            <ServiceStoreButtonLink href={`/app/branches/${branchId}/hours`}>
              Edit operating hours
            </ServiceStoreButtonLink>
            <Link href="/app/setup/payment" className="text-sm font-semibold text-[#0F9B76] hover:underline">
              Continue to payment
            </Link>
          </div>
        </ServiceStoreCard>
        <ServiceStoreSetupProgress progress={progress} currentStep="hours" />
      </div>
    </ServiceStorePublicLayout>
  );
}
