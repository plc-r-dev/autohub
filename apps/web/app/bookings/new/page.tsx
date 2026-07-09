import { notFound, redirect } from "next/navigation";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { CreateBookingForm } from "@/components/booking/create-booking-form";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { resolveBookingCatalog } from "@/lib/booking/engine/validate-create";
import { requireCustomerForUser } from "@/lib/customer/context";
import { prisma } from "@/lib/prisma";
import {
  getMerchantAccessState,
  isMerchantUser,
} from "@/lib/merchant/access";

type PageProps = {
  searchParams: Promise<{ branchId?: string; serviceId?: string }>;
};

export default async function NewBookingPage({ searchParams }: PageProps) {
  const { branchId, serviceId } = await searchParams;
  const { user } = await requireDomainUser();
  const merchantAccess = await getMerchantAccessState(user.id);

  if (isMerchantUser(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    redirect("/onboarding/customer");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { customerId: customer.id },
    select: {
      id: true,
      licensePlate: true,
      brand: true,
      model: true,
      province: true,
      color: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!branchId || !serviceId) {
    redirect("/browse");
  }

  const catalog = await resolveBookingCatalog(branchId, serviceId);

  if (!catalog.ok) {
    notFound();
  }

  const { context } = catalog;

  return (
    <PageShell
      title="Create booking"
      description={`${context.merchantName} · ${context.branchName}`}
      nav={customerNav}
      backHref={`/browse/${context.merchantId}/branches/${context.branchId}`}
    >
      <CreateBookingForm
        branchId={context.branchId}
        serviceId={context.serviceId}
        serviceName={context.serviceName}
        servicePrice={context.servicePrice.toString()}
        serviceDuration={context.serviceDuration}
        serviceBufferMinutes={context.serviceBufferMinutes}
        vehicles={vehicles}
      />
    </PageShell>
  );
}
