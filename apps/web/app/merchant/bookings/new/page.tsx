import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { WalkInBookingForm } from "@/components/booking/walk-in-booking-form";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { prisma } from "@/lib/prisma";

export default async function NewWalkInBookingPage() {
  const { merchant } = await requireApprovedMerchantUser();

  const branches = await prisma.branch.findMany({
    where: { merchantId: merchant.id },
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
      nav={merchantNav}
      backHref="/merchant/bookings"
    >
      {branchOptions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add at least one active service to a branch before creating walk-in
          bookings.
        </p>
      ) : (
        <WalkInBookingForm branches={branchOptions} />
      )}
    </PageShell>
  );
}
