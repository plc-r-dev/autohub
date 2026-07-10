import { notFound } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { EmptyState, ServiceCard } from "@/components/customer/ui";
import { getBrowseBranch } from "@/lib/booking/discovery-queries";

type PageProps = {
  params: Promise<{ merchantId: string; branchId: string }>;
};

export default async function BrowseBranchPage({ params }: PageProps) {
  const { merchantId, branchId } = await params;
  const branch = await getBrowseBranch(merchantId, branchId);
  if (!branch) notFound();

  const canBook = branch.merchant.booking.bookable;
  const phone = branch.phone?.trim() || null;

  return (
    <CustomerShell
      showNav={false}
      backHref={`/browse/${merchantId}`}
      backLabel={branch.merchant.name}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-[14px] font-medium text-[#0F9B76]">{branch.merchant.name}</p>
          <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            {branch.name}
          </h1>
          {branch.address ? (
            <p className="mt-3 text-[16px] text-[#64748B]">{branch.address}</p>
          ) : null}
        </div>

        <section className="flex flex-col gap-4">
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
                bufferMinutes={service.bufferMinutes}
                price={service.price}
                bookHref={`/bookings/new?branchId=${branch.id}&serviceId=${service.id}`}
                showPrice={true}
                canBook={canBook}
                phone={phone}
              />
            ))
          )}
        </section>
      </div>
    </CustomerShell>
  );
}
