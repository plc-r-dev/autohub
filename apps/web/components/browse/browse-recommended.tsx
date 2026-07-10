import Link from "next/link";
import type { BrowseMerchantCardData } from "@/components/browse/merchant-card";
import { CustomerSectionHeader } from "@/components/customer/customer-ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";

type BrowseRecommendedProps = {
  merchants: BrowseMerchantCardData[];
};

export function BrowseRecommended({ merchants }: BrowseRecommendedProps) {
  if (merchants.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <CustomerSectionHeader title="Recommended" />
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {merchants.map((merchant) => (
          <Link
            key={merchant.id}
            href={`/browse/${merchant.id}`}
            className="w-[160px] shrink-0 active:scale-[0.98]"
          >
            <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <ServiceShopImage
                merchantId={merchant.id}
                merchantName={merchant.name}
                className="h-[100px]"
                sizes="160px"
              />
              <div className="p-4">
                <p className="truncate text-[14px] font-semibold text-[#18181B]">{merchant.name}</p>
                <p className="mt-1 text-[12px] text-[#71717A]">
                  {merchant.rating ?? "4.8"} · {merchant.distance ?? "1.2 km"}
                </p>
                <p className="mt-2 text-[13px] font-semibold text-[#0F766E]">
                  {merchant.startingPrice ?? "฿299"}+
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
