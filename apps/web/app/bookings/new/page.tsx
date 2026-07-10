import { notFound, redirect } from "next/navigation";
import { BookingConfirmationForm } from "@/components/booking/booking-confirmation-form";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ButtonLink, Card } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { getMerchantBookingFactsByBranchId } from "@/lib/booking/discovery-queries";
import { resolveBookingCatalog } from "@/lib/booking/engine/validate-create";
import { requireCustomerForUser } from "@/lib/customer/context";
import {
  isMerchantBookable,
  toMarketplaceBookingPresentation,
} from "@/lib/marketplace/booking-availability";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ branchId?: string; serviceId?: string; vehicleId?: string }>;
};

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const { branchId, serviceId, vehicleId } = await searchParams;
  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) redirect("/browse");
  if (!branchId || !serviceId) redirect("/browse");

  const facts = await getMerchantBookingFactsByBranchId(branchId);
  if (!facts || !isMerchantBookable(facts)) {
    const presentation = facts ? toMarketplaceBookingPresentation(facts) : null;
    return (
      <CustomerShell showNav={false} backHref="/browse">
        <Card className="mx-auto max-w-lg py-12 text-center">
          <p className="font-medium text-[#0A0A0A]">
            {presentation?.unavailableMessage ?? "This service shop is not available for booking."}
          </p>
          <div className="mt-6">
            <ButtonLink href="/browse" variant="secondary">
              Back home
            </ButtonLink>
          </div>
        </Card>
      </CustomerShell>
    );
  }

  const catalog = await resolveBookingCatalog(branchId, serviceId);
  if (!catalog.ok) notFound();
  const { context } = catalog;

  const [vehicles, lastBooking, branch] = await Promise.all([
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
    prisma.branch.findUnique({
      where: { id: branchId },
      select: {
        name: true,
        address: true,
        services: {
          where: { id: serviceId, isActive: true },
          select: {
            id: true,
            name: true,
            duration: true,
            bufferMinutes: true,
            price: true,
          },
        },
      },
    }),
  ]);

  const service = branch?.services[0];
  if (!service) notFound();

  const defaultVehicleId =
    vehicleId && vehicles.some((vehicle) => vehicle.id === vehicleId)
      ? vehicleId
      : lastBooking?.vehicleId && vehicles.some((vehicle) => vehicle.id === lastBooking.vehicleId)
        ? lastBooking.vehicleId
        : vehicles[0]?.id;

  const backHref = `/browse/${context.merchantId}`;

  return (
    <CustomerShell showNav={false} backHref={backHref} backLabel="Service shop">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            Booking confirmation
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Review your details before confirming</p>
        </div>
        <BookingConfirmationForm
          merchantId={context.merchantId}
          merchantName={context.merchantName}
          branchName={branch?.name ?? context.branchName}
          branchAddress={branch?.address ?? null}
          branchId={context.branchId}
          serviceId={service.id}
          service={{
            id: service.id,
            name: service.name,
            duration: service.duration,
            bufferMinutes: service.bufferMinutes,
            price: service.price.toString(),
          }}
          vehicles={vehicles}
          defaultVehicleId={defaultVehicleId}
          backHref={backHref}
        />
      </div>
    </CustomerShell>
  );
}
