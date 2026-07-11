import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { BranchForm } from "@/components/service-store/branch-form";
import { ServiceStoreCard } from "@/components/service-store/ui";

export default function NewBranchPage() {
  return (
    <PageShell
      title="New branch"
      description="Create a new branch location."
      nav={serviceStoreNav}
      backHref="/service-store/branches"
      backLabel="Branches"
    >
      <ServiceStoreCard>
        <BranchForm mode="create" />
      </ServiceStoreCard>
    </PageShell>
  );
}
