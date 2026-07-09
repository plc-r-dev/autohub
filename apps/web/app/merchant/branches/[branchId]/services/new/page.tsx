import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { ServiceForm } from "@/components/merchant/service-form";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function NewServicePage({ params }: PageProps) {
  const { branchId } = await params;
  const { merchant } = await requireApprovedMerchantUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, merchantId: merchant.id },
  });

  if (!branch) {
    notFound();
  }

  return (
    <PageShell
      title="New service"
      description={`Add a service to ${branch.name}`}
      nav={merchantNav}
      backHref={`/merchant/branches/${branchId}/services`}
    >
      <ServiceForm mode="create" branchId={branchId} />
    </PageShell>
  );
}
