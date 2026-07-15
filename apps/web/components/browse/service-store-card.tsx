import Link from "next/link";
import { CustomerCard } from "@/components/customer/customer-ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";

export type BrowseServiceStoreCardData = {
  id: string;
  name: string;
  description: string | null;
  branchCount: number;
  areaLabel?: string | null;
  openingStatus?: "open" | "closed" | null;
  startingPrice?: string | null;
  hasApprovedClaim?: boolean;
  bookHref: string;
  canBook?: boolean;
  rating?: string;
  distance?: string;
};

type ServiceStoreCardProps = {
  serviceStore: BrowseServiceStoreCardData;
};

export function ServiceStoreCard({ serviceStore }: ServiceStoreCardProps) {
  const detailHref = `/browse/${serviceStore.id}`;
  const canBook = serviceStore.canBook === true;
  const hasApprovedClaim = serviceStore.hasApprovedClaim ?? false;
  const isOpen = serviceStore.openingStatus !== "closed";
  const rating = serviceStore.rating ?? "4.8";
  const distance = serviceStore.distance ?? "1.2 km";

  return (
    <CustomerCard padding={false} className="transition-transform active:scale-[0.99]">
      <Link href={detailHref} className="block">
        <div className="relative h-[140px]">
          <ServiceShopImage
            serviceStoreId={serviceStore.id}
            serviceStoreName={serviceStore.name}
            className="h-full"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#18181B]">
              {rating} ★
            </span>
            <span
              className={
                isOpen
                  ? "rounded-full bg-[#0F766E] px-2.5 py-1 text-[11px] font-semibold text-white"
                  : "rounded-full bg-[#71717A] px-2.5 py-1 text-[11px] font-semibold text-white"
              }
            >
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-[17px] font-semibold tracking-tight text-[#18181B]">{serviceStore.name}</h3>
          <p className="mt-1 text-[14px] text-[#71717A]">{distance}</p>
          {serviceStore.startingPrice ? (
            <p className="mt-3 text-[15px] font-semibold text-[#18181B]">
              From <span className="text-[#0F766E]">{serviceStore.startingPrice ?? "฿299"}</span>
            </p>
          ) : null}
        </div>
      </Link>
      <div className="border-t border-[#F4F4F5] px-5 pb-5">
        {canBook ? (
          <Link
            href={`/browse/${serviceStore.id}`}
            className="flex h-[48px] items-center justify-center rounded-[20px] bg-[#18181B] text-[14px] font-semibold text-white active:bg-[#27272A]"
          >
            Book now
          </Link>
        ) : (
          <span className="flex h-[48px] items-center justify-center rounded-[20px] bg-[#F4F4F5] text-[14px] font-semibold text-[#A1A1AA]">
            Coming soon
          </span>
        )}
      </div>
    </CustomerCard>
  );
}
