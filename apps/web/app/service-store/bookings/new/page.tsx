import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { WalkInBookingForm } from "@/components/booking/walk-in-booking-form";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

export default async function NewWalkInBookingPage() {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const branches = await prisma.branch.findMany({
    where: { serviceStoreId: serviceStore.id },
    select: {
      id: true,
      name: true,
      services: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          duration: true,
          bufferMinutes: true,
          price: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const branchOptions = branches
    .filter((branch) => branch.services.length > 0)
    .map((branch) => ({
      id: branch.id,
      name: branch.name,
      services: branch.services.map((service) => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        bufferMinutes: service.bufferMinutes,
        price: service.price.toString(),
      })),
    }));

  return (
    <PageShell
      title="Walk-in booking"
      description="Create a booking for a customer at the counter."
      nav={serviceStoreNav}
      backHref="/service-store/bookings"
      backLabel="Bookings"
    >
      {branchOptions.length === 0 ? (
        <ServiceStoreCard>
          <p className="text-sm text-[#5b6b7a]">
            Add at least one active service to a branch before creating walk-in bookings.
          </p>
        </ServiceStoreCard>
      ) : (
        <ServiceStoreCard>
          <WalkInBookingForm branches={branchOptions} />
        </ServiceStoreCard>
      )}
    </PageShell>
  );
}
