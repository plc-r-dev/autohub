import { notFound } from "next/navigation";
import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerFooter } from "@/components/customer/customer-footer";
import { MerchantHero } from "@/components/customer/merchant/merchant-hero";
import { MerchantGallery } from "@/components/customer/merchant/merchant-gallery";
import {
  MerchantServicePackageCard,
  type ServicePackage,
} from "@/components/customer/merchant/merchant-service-package-card";
import { EmptyState } from "@/components/customer/ui";
import { getBrowseMerchant } from "@/lib/booking/discovery-queries";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ merchantId: string }>;
};

const HOURS = [
  { day: "Mon – Fri", hours: "9:00 – 18:00" },
  { day: "Sat – Sun", hours: "9:00 – 20:00" },
];

function ServicePackagesList({
  packages,
  showPrice,
  canBook,
  phone,
}: {
  packages: ServicePackage[];
  showPrice: boolean;
  canBook: boolean;
  phone: string | null;
}) {
  if (packages.length === 0) {
    return <EmptyState title="No services" description="Check back soon." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {packages.map((service) => (
        <MerchantServicePackageCard
          key={service.id}
          service={service}
          compact
          showPrice={showPrice}
          canBook={canBook}
          phone={phone}
        />
      ))}
    </div>
  );
}

export default async function BrowseMerchantPage({ params }: PageProps) {
  const { merchantId } = await params;
  const merchant = await getBrowseMerchant(merchantId);
  if (!merchant) notFound();

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      branch: { merchantId },
    },
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      branchId: true,
    },
    orderBy: { name: "asc" },
  });

  const firstBranch = merchant.branches.find((b) => b.services.length > 0);
  const firstService = services[0];
  const bookHref =
    firstBranch && firstService
      ? `/bookings/new?branchId=${firstService.branchId}&serviceId=${firstService.id}`
      : merchant.bookHref;
  const address = merchant.branches.find((b) => b.address)?.address ?? null;
  const phone = merchant.phone ?? merchant.branches.find((b) => b.phone)?.phone ?? null;
  const mapsQuery = address ?? merchant.name;

  const servicePackages: ServicePackage[] = services.map((service, index) => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: service.price,
    branchId: service.branchId,
    popular: index === 0,
  }));

  const description =
    merchant.description?.trim() ||
    "Experience the pinnacle of automotive care with our premium, eco-certified services tailored for your vehicle.";

  return (
    <CustomerShell
      backHref="/browse"
      backLabel="Service shops"
      className="!bg-[#F8F8F8]"
    >
      <div className="flex flex-col gap-10 pb-12">
        <MerchantHero merchantId={merchant.id} name={merchant.name} description={description} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <section className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-[#0A0A0A] lg:text-[20px]">
              Service Packages
            </h2>
            <ServicePackagesList
              packages={servicePackages}
              showPrice={true}
              canBook={merchant.booking.bookable}
              phone={phone}
            />
          </section>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
            <MerchantGallery merchantId={merchant.id} merchantName={merchant.name} />

            <article className="rounded-[20px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Clock className="size-5 text-[#062C21]" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="font-serif text-[18px] font-semibold text-[#0A0A0A]">
                    Business Hours
                  </h2>
                  <ul className="mt-4 space-y-2 text-[14px]">
                    {HOURS.map((row) => (
                      <li key={row.day} className="flex justify-between gap-4 text-[#64748B]">
                        <span>{row.day}</span>
                        <span className="font-medium text-[#0A0A0A]">{row.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className="rounded-[20px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <MapPin className="size-5 text-[#062C21]" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-[18px] font-semibold text-[#0A0A0A]">
                    Location
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-[#64748B]">
                    {address ?? "Address available at booking confirmation."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#E2E8F0] px-4 text-[13px] font-semibold text-[#0A0A0A]"
                      >
                        <Phone className="size-4" />
                        Call
                      </a>
                    ) : null}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#E2E8F0] px-4 text-[13px] font-semibold text-[#0A0A0A]"
                    >
                      <Navigation className="size-4" />
                      Navigate
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <CustomerFooter />
      </div>
    </CustomerShell>
  );
}
