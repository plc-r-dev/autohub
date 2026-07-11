import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { VehicleList } from "@/components/customer/vehicle-list";
import { ButtonLink, EmptyState } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import { prisma } from "@/lib/prisma";

export default async function VehiclesPage() {
  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    redirect("/browse");
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

  return (
    <CustomerShell>
      <div className="flex flex-col gap-8 pb-24">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            Vehicles
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Your saved cars for faster booking</p>
        </div>

        {vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles yet"
            description="Add your first vehicle when you book a service — it takes seconds."
            action={<ButtonLink href="/browse">Book service</ButtonLink>}
          />
        ) : (
          <VehicleList vehicles={vehicles} />
        )}
      </div>
    </CustomerShell>
  );
}
