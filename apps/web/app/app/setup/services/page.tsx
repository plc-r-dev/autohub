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
import { prisma } from "@/lib/prisma";

export default async function ServiceStoreSetupServicesPage() {
  const ctx = await requireServiceStoreContext();
  const progress = await getOnboardingSetupProgress(ctx.serviceStore.id);
  const branchId = await getPrimaryBranchId(ctx.serviceStore.id);

  if (!progress || !branchId) {
    redirect("/app/setup/verify-business");
  }

  const services = await prisma.service.findMany({
    where: { branchId, isActive: true },
    select: { id: true, name: true, price: true },
    orderBy: { name: "asc" },
  });

  return (
    <ServiceStorePublicLayout
      title="Configure services"
      description="Add at least one active service customers can book."
      backHref="/app/setup"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ServiceStoreCard className="space-y-4">
          {services.length === 0 ? (
            <p className="text-sm text-[#5b6b7a]">No active services yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.id} className="rounded-xl border border-[#eef3f7] px-4 py-3">
                  {service.name}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <ServiceStoreButtonLink href={`/app/branches/${branchId}/services/new`}>
              Add service
            </ServiceStoreButtonLink>
            <Link href="/app/setup/hours" className="text-sm font-semibold text-[#0F9B76] hover:underline">
              Continue to hours
            </Link>
          </div>
        </ServiceStoreCard>
        <ServiceStoreSetupProgress progress={progress} currentStep="services" />
      </div>
    </ServiceStorePublicLayout>
  );
}
