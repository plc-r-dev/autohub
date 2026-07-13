import Link from "next/link";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreReadinessCard } from "@/components/service-store/service-store-readiness-card";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import { getServiceStoreReadiness } from "@/lib/service-store/application/readiness-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";

export default async function ServiceStoreReadinessPage() {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.STORE_VIEW);
  const readiness = await getServiceStoreReadiness(ctx.serviceStore.id);

  return (
    <PageShell
      title="Readiness"
      description="Complete every checklist item before customers can book online."
      nav={serviceStoreNav}
      backHref="/app/dashboard"
    >
      {readiness ? (
        <ServiceStoreReadinessCard readiness={readiness} />
      ) : (
        <ServiceStoreCard>
          <p className="text-sm text-[#5b6b7a]">Unable to load readiness for this Service Store.</p>
        </ServiceStoreCard>
      )}

      <ServiceStoreCard className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0F172A]">What happens when you are ready?</h3>
        <p className="text-sm text-[#5b6b7a]">
          Ready Service Stores appear as bookable on the customer marketplace. Until then, customers
          can view your profile but cannot complete an online booking.
        </p>
        <div className="flex flex-wrap gap-2">
          <ServiceStoreButtonLink href="/app/settings" variant="secondary">
            Update profile
          </ServiceStoreButtonLink>
          <ServiceStoreButtonLink href="/app/branches" variant="secondary">
            Manage branches
          </ServiceStoreButtonLink>
          <Link
            href="/browse"
            className="inline-flex items-center text-sm font-semibold text-[#16A34A] hover:underline"
          >
            Preview marketplace listing
          </Link>
        </div>
      </ServiceStoreCard>
    </PageShell>
  );
}
