import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { BranchForm } from "@/components/service-store/branch-form";
import { DeleteBranchButton } from "@/components/service-store/delete-branch-button";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function EditBranchPage({ params }: PageProps) {
  const { branchId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
  });

  if (!branch) {
    notFound();
  }

  return (
    <PageShell
      title="Edit branch"
      description={branch.name}
      nav={serviceStoreNav}
      backHref="/service-store/branches"
    >
      <ServiceStoreCard>
        <BranchForm
          mode="edit"
          branchId={branch.id}
          defaultValues={{
            code: branch.code,
            name: branch.name,
            phone: branch.phone ?? "",
            address: branch.address ?? "",
            slotIntervalMinutes: branch.slotIntervalMinutes,
            concurrentCapacity: branch.concurrentCapacity,
          }}
        />
      </ServiceStoreCard>

      <div className="flex flex-wrap gap-3">
        <ServiceStoreButtonLink
          href={`/service-store/branches/${branch.id}/hours`}
          variant="secondary"
        >
          Operating hours
        </ServiceStoreButtonLink>
        <ServiceStoreButtonLink
          href={`/service-store/branches/${branch.id}/services`}
          variant="secondary"
        >
          Services
        </ServiceStoreButtonLink>
      </div>

      <DeleteBranchButton branchId={branch.id} />
    </PageShell>
  );
}
