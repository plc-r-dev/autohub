import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { BranchHoursForm } from "@/components/service-store/branch-hours-form";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { getDefaultOperatingHours } from "@/lib/booking/engine/time";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
};

export default async function BranchHoursPage({ params }: PageProps) {
  const { branchId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
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
      nav={serviceStoreNav}
      backHref={`/service-store/branches/${branch.id}`}
      backLabel="Branch"
    >
      <ServiceStoreCard>
        <p className="mb-5 text-sm text-[#5b6b7a]">
          Set weekly opening hours for this branch. Slot intervals are configured in branch
          settings.
        </p>
        <BranchHoursForm branchId={branch.id} hours={hours} />
      </ServiceStoreCard>

      <ServiceStoreButtonLink href={`/service-store/branches/${branch.id}`} variant="secondary">
        Branch settings
      </ServiceStoreButtonLink>
    </PageShell>
  );
}
