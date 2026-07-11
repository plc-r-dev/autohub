import { redirect } from "next/navigation";
import { ServiceStoreSetupVerifyForm } from "@/components/service-store/setup/service-store-setup-verify-form";
import { ServiceStoreSetupProgress } from "@/components/service-store/setup/service-store-setup-progress";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { getOnboardingSetupProgress, getPrimaryBranchId } from "@/lib/service-store/application/onboarding-setup-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { prisma } from "@/lib/prisma";

export default async function ServiceStoreSetupVerifyPage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);
  const branchId = await getPrimaryBranchId(ctx.serviceStore.id);
  const branch = branchId
    ? await prisma.branch.findUnique({
        where: { id: branchId },
        select: { address: true, latitude: true, longitude: true },
      })
    : null;

  if (!progress) {
    redirect("/service-store/onboarding");
  }

  return (
    <ServiceStorePublicLayout
      title="Verify business information"
      description="Confirm your store profile and primary location."
      backHref="/service-store/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreSetupVerifyForm
          defaultValues={{
            name: ctx.serviceStore.name,
            phone: ctx.serviceStore.phone ?? "",
            email: ctx.serviceStore.email ?? "",
            website: ctx.serviceStore.website ?? "",
            description: ctx.serviceStore.description ?? "",
            businessCategory: ctx.serviceStore.businessCategory ?? "",
            address: branch?.address ?? "",
            latitude: branch?.latitude ? Number(branch.latitude) : "",
            longitude: branch?.longitude ? Number(branch.longitude) : "",
          }}
        />
        <ServiceStoreSetupProgress progress={progress} currentStep="verify-business" />
      </div>
    </ServiceStorePublicLayout>
  );
}
