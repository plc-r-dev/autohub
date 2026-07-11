import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { ButtonLink, Card } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { getServiceStoreBookingFactsByBranchId } from "@/lib/booking/discovery-queries";
import { resolveBookingCatalog } from "@/lib/booking/engine/validate-create";
import { resolveBookingWizardStep } from "@/lib/booking/wizard";
import { requireCustomerForUser } from "@/lib/customer/context";
import {
  isServiceStoreBookable,
  toMarketplaceBookingPresentation,
} from "@/lib/marketplace/booking-availability";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    serviceStoreId?: string;
    branchId?: string;
    serviceId?: string;
    vehicleId?: string;
    step?: string;
  }>;
};

export default async function BookingWizardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) redirect("/browse");

  const serviceStoreId = params.serviceStoreId;
  if (!serviceStoreId) redirect("/browse");

  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      id: true,
      name: true,
      description: true,
      branches: {
        select: {
          id: true,
          name: true,
          address: true,
          services: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              duration: true,
              bufferMinutes: true,
              price: true,
              branchId: true,
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!store) redirect("/browse");

  const services = store.branches.flatMap((branch) =>
    branch.services.map((service) => ({
      id: service.id,
      name: service.name,
      duration: service.duration,
      bufferMinutes: service.bufferMinutes,
      price: service.price.toString(),
      branchId: service.branchId,
      branchName: branch.name,
    })),
  );

  const branches = store.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
  }));

  const resolvedServiceId =
    params.serviceId && services.some((service) => service.id === params.serviceId)
      ? params.serviceId
      : undefined;
  const resolvedBranchId =
    params.branchId && branches.some((branch) => branch.id === params.branchId)
      ? params.branchId
      : resolvedServiceId
        ? services.find((service) => service.id === resolvedServiceId)?.branchId
        : undefined;

  if (resolvedBranchId && resolvedServiceId) {
    const facts = await getServiceStoreBookingFactsByBranchId(resolvedBranchId);
    if (!facts || !isServiceStoreBookable(facts)) {
      const presentation = facts ? toMarketplaceBookingPresentation(facts) : null;
      return (
        <CustomerShell backHref={`/browse/${serviceStoreId}`} backLabel="Service shop">
          <Card className="py-10 text-center">
            <p className="text-[15px] text-[#0A0A0A]">
              {presentation?.unavailableMessage ?? "This service shop is not available for booking."}
            </p>
            <div className="mt-6">
              <ButtonLink href="/browse" variant="secondary">
                Browse stores
              </ButtonLink>
            </div>
          </Card>
        </CustomerShell>
      );
    }

    const catalog = await resolveBookingCatalog(resolvedBranchId, resolvedServiceId);
    if (!catalog.ok) redirect(`/browse/${serviceStoreId}`);
  }

  const [vehicles, lastBooking] = await Promise.all([
    prisma.vehicle.findMany({
      where: { customerId: customer.id },
      select: {
        id: true,
        licensePlate: true,
        brand: true,
        model: true,
        province: true,
        color: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.booking.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      select: { vehicleId: true },
    }),
  ]);

  const defaultVehicleId =
    params.vehicleId && vehicles.some((vehicle) => vehicle.id === params.vehicleId)
      ? params.vehicleId
      : lastBooking?.vehicleId && vehicles.some((vehicle) => vehicle.id === lastBooking.vehicleId)
        ? lastBooking.vehicleId
        : vehicles[0]?.id;

  const branchesForService = resolvedServiceId
    ? branches.filter((branch) =>
        services.some((service) => service.id === resolvedServiceId && service.branchId === branch.id),
      ).length
    : branches.length;

  const initialStep = resolveBookingWizardStep({
    requestedStep: params.step,
    serviceId: resolvedServiceId,
    branchId: resolvedBranchId,
    branchesForService,
  });

  return (
    <CustomerShell
      backHref={`/browse/${serviceStoreId}`}
      backLabel="Service shop"
      title="Book appointment"
      subtitle={store.name}
    >
      <BookingWizard
        serviceStoreId={store.id}
        serviceStoreName={store.name}
        storeDescription={store.description}
        initialStep={initialStep}
        services={services}
        branches={branches}
        vehicles={vehicles}
        initialServiceId={resolvedServiceId}
        initialBranchId={resolvedBranchId}
        initialVehicleId={defaultVehicleId}
        backHref={`/browse/${serviceStoreId}`}
      />
    </CustomerShell>
  );
}
