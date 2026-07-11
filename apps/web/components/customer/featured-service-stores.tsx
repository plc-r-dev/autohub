import Link from "next/link";
import type { ServiceStoreCardData } from "@/components/customer/ui";
import { SectionHeader } from "@/components/customer/ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";

type FeaturedServiceStoresProps = {
  serviceStores: ServiceStoreCardData[];
};

export function FeaturedServiceStores({ serviceStores }: FeaturedServiceStoresProps) {
  if (serviceStores.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <SectionHeader title="Featured service shops" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceStores.slice(0, 3).map((serviceStore) => (
          <Link
            key={serviceStore.id}
            href={`/browse/${serviceStore.id}`}
            className="group overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <ServiceShopImage
              serviceStoreId={serviceStore.id}
              serviceStoreName={serviceStore.name}
              className="h-40"
            />
            <div className="p-5">
              <p className="font-semibold text-[#0A0A0A]">{serviceStore.name}</p>
              <p className="mt-1 text-[14px] text-[#64748B]">
                {serviceStore.rating} ★ · {serviceStore.distance}
              </p>
              <p className="mt-2 text-[14px] font-semibold text-[#0F9B76]">
                From {serviceStore.startingPrice ?? "฿299"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
