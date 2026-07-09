import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { ServiceForm } from "@/components/merchant/service-form";
import { DeleteServiceButton } from "@/components/merchant/delete-service-button";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string; serviceId: string }>;
};

export default async function EditServicePage({ params }: PageProps) {
  const { branchId, serviceId } = await params;
  const { merchant } = await requireApprovedMerchantUser();

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      branchId,
      branch: { merchantId: merchant.id },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <PageShell
      title="Edit service"
      description={service.name}
      nav={merchantNav}
      backHref={`/merchant/branches/${branchId}/services`}
    >
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
      <DeleteServiceButton branchId={branchId} serviceId={service.id} />
    </PageShell>
  );
}
