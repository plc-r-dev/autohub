import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreProfileForm } from "@/components/service-store/service-store-profile-form";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";

export default async function ServiceStoreProfilePage() {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  return (
    <PageShell
      title="Settings"
      description="Update your business profile and contact information."
      nav={serviceStoreNav}
      backHref="/app/dashboard"
    >
      <ServiceStoreCard>
        <ServiceStoreProfileForm
          defaultValues={{
            name: serviceStore.name,
            description: serviceStore.description ?? "",
            phone: serviceStore.phone ?? "",
            email: serviceStore.email ?? "",
            website: serviceStore.website ?? "",
          }}
        />
      </ServiceStoreCard>
    </PageShell>
  );
}
