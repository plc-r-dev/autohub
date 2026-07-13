import { redirect } from "next/navigation";
import { AddVehicleForm } from "@/components/customer/add-vehicle-form";
import { CustomerShell } from "@/components/customer/customer-shell";
import { Card } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

function safeReturnTo(value?: string): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }
  return value;
}

export default async function NewVehiclePage({ searchParams }: PageProps) {
  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) redirect("/browse");

  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const backHref = returnTo ?? "/vehicles";
  const backLabel = returnTo?.startsWith("/bookings/new") ? "Booking" : "Vehicles";

  return (
    <CustomerShell backHref={backHref} backLabel={backLabel}>
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#0F172A]">Add vehicle</h1>
          <p className="mt-2 text-[16px] text-[#64748B]">
            Save your car once and book faster next time.
          </p>
        </div>
        <Card>
          <AddVehicleForm returnTo={returnTo} submitLabel="Save and continue" />
        </Card>
      </div>
    </CustomerShell>
  );
}
