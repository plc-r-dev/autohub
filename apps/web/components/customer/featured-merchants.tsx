import Link from "next/link";
import type { MerchantCardData } from "@/components/customer/ui";
import { SectionHeader } from "@/components/customer/ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";

type FeaturedMerchantsProps = {
  merchants: MerchantCardData[];
};

export function FeaturedMerchants({ merchants }: FeaturedMerchantsProps) {
  if (merchants.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <SectionHeader title="Featured service shops" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {merchants.slice(0, 3).map((merchant) => (
          <Link
            key={merchant.id}
            href={`/browse/${merchant.id}`}
            className="group overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <ServiceShopImage
              merchantId={merchant.id}
              merchantName={merchant.name}
              className="h-40"
            />
            <div className="p-5">
              <p className="font-semibold text-[#0A0A0A]">{merchant.name}</p>
              <p className="mt-1 text-[14px] text-[#64748B]">
                {merchant.rating} ★ · {merchant.distance}
              </p>
              <p className="mt-2 text-[14px] font-semibold text-[#0F9B76]">
                From {merchant.startingPrice ?? "฿299"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
