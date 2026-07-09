import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { BranchHoursForm } from "@/components/merchant/branch-hours-form";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { getDefaultOperatingHours } from "@/lib/booking/engine/time";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function BranchHoursPage({ params }: PageProps) {
  const { branchId } = await params;
  const { merchant } = await requireApprovedMerchantUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, merchantId: merchant.id },
    select: {
      id: true,
      name: true,
      operatingHours: {
        orderBy: { dayOfWeek: "asc" },
        select: {
          dayOfWeek: true,
          openTime: true,
          closeTime: true,
          isClosed: true,
        },
      },
    },
  });

  if (!branch) {
    notFound();
  }

  const defaults = getDefaultOperatingHours();
  const hoursByDay = new Map(
    branch.operatingHours.map((hour) => [hour.dayOfWeek, hour]),
  );
  const hours = defaults.map((defaultHour) => {
    const existing = hoursByDay.get(defaultHour.dayOfWeek);
    return existing ?? defaultHour;
  });

  return (
    <PageShell
      title="Operating hours"
      description={branch.name}
      nav={merchantNav}
      backHref={`/merchant/branches/${branch.id}`}
    >
      <p className="text-muted-foreground mb-4 text-sm">
        Set weekly opening hours and slot interval for this branch.{" "}
        <Link
          href={`/merchant/branches/${branch.id}`}
          className="text-foreground underline"
        >
          Edit branch settings
        </Link>
      </p>
      <BranchHoursForm branchId={branch.id} hours={hours} />
    </PageShell>
  );
}
