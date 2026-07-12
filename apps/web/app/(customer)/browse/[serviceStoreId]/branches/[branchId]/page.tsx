import { notFound } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { EmptyState, ServiceCard } from "@/components/customer/ui";
import { getBrowseBranch } from "@/lib/booking/discovery-queries";
import { buildBookingWizardHref } from "@/lib/booking/wizard";

type PageProps = {
  params: Promise<{ serviceStoreId: string; branchId: string }>;
};

export default async function BrowseBranchPage({ params }: PageProps) {
  const { serviceStoreId, branchId } = await params;
  const branch = await getBrowseBranch(serviceStoreId, branchId);
  if (!branch) notFound();

  const canBook = branch.serviceStore.booking.bookable;

  return (
    <CustomerShell
      backHref={`/browse/${serviceStoreId}`}
      backLabel={branch.serviceStore.name}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-[14px] font-medium text-[#0F9B76]">{branch.serviceStore.name}</p>
          <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            {branch.name}
          </h1>
          {branch.address ? (
            <p className="mt-3 text-[16px] text-[#64748B]">{branch.address}</p>
          ) : null}
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {branch.services.length === 0 ? (
            <EmptyState
              title="No services"
              description="This branch has no bookable services right now."
            />
          ) : (
            branch.services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                duration={service.duration}
                price={service.price}
                bookHref={buildBookingWizardHref({
                  serviceStoreId,
                  branchId: branch.id,
                  serviceId: service.id,
                })}
                canBook={canBook}
                serviceStoreId={serviceStoreId}
                imageSeed={service.name}
                imageSlot={service.name.length % 6}
              />
            ))
          )}
        </section>
      </div>
    </CustomerShell>
  );
}
