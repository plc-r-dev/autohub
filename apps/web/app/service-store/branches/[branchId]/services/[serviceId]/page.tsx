import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceForm } from "@/components/service-store/service-form";
import { DeleteServiceButton } from "@/components/service-store/delete-service-button";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string; serviceId: string }>;
};

export default async function EditServicePage({ params }: PageProps) {
  const { branchId, serviceId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      branchId,
      branch: { serviceStoreId: serviceStore.id },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <PageShell
      title="Edit service"
      description={service.name}
      nav={serviceStoreNav}
      backHref={`/service-store/branches/${branchId}/services`}
      backLabel="Services"
    >
      <ServiceStoreCard>
        <ServiceForm
          mode="edit"
          branchId={branchId}
          serviceId={service.id}
          defaultValues={{
            code: service.code,
            name: service.name,
            duration: service.duration,
            bufferMinutes: service.bufferMinutes,
            price: service.price.toString(),
            isActive: service.isActive,
          }}
        />
      </ServiceStoreCard>
      <DeleteServiceButton branchId={branchId} serviceId={service.id} />
    </PageShell>
  );
}
