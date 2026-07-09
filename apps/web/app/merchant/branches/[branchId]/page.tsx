import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { BranchForm } from "@/components/merchant/branch-form";
import { DeleteBranchButton } from "@/components/merchant/delete-branch-button";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function EditBranchPage({ params }: PageProps) {
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
      title="Edit branch"
      description={branch.name}
      nav={merchantNav}
      backHref="/merchant/branches"
    >
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
      <p className="text-muted-foreground mt-4 text-sm">
        <Link
          href={`/merchant/branches/${branch.id}/hours`}
          className="text-foreground underline"
        >
          Manage operating hours
        </Link>
      </p>
      <DeleteBranchButton branchId={branch.id} />
    </PageShell>
  );
}
