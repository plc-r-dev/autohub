import Link from "next/link";
import { redirect } from "next/navigation";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import { getOnboardingSetupProgress } from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";

export default async function ServiceStoreSetupTeamPage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);

  if (!progress) {
    redirect("/app/onboarding");
  }

  return (
    <ServiceStorePublicLayout
      title="Invite team members"
      description="Optional — add managers, staff, or finance users now or later."
      backHref="/app/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreCard className="space-y-4">
          <p className="text-sm text-[#5b6b7a]">
            You can invite team members by phone number from the members page. This step is optional.
          </p>
          <div className="flex flex-wrap gap-2">
            <ServiceStoreButtonLink href="/app/members">Manage members</ServiceStoreButtonLink>
            <Link href="/app/setup/complete" className="text-sm font-semibold text-[#0F9B76] hover:underline">
              Skip and finish setup
            </Link>
          </div>
        </ServiceStoreCard>
        <ServiceStoreSetupProgress progress={progress} currentStep="team" />
      </div>
    </ServiceStorePublicLayout>
  );
}
