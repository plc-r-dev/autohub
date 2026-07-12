import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceForm } from "@/components/service-store/service-form";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function NewServicePage({ params }: PageProps) {
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
      title="New service"
      description={`Add a service to ${branch.name}`}
      nav={serviceStoreNav}
      backHref={`/app/branches/${branchId}/services`}
      backLabel="Services"
    >
      <ServiceStoreCard>
        <ServiceForm mode="create" branchId={branchId} />
      </ServiceStoreCard>
    </PageShell>
  );
}
