import Link from "next/link";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { ButtonLink } from "@/components/customer/ui/button";
import { Phone, Star } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type ServiceStoreCardData = {
  id: string;
  name: string;
  bookHref: string;
  phone?: string | null;
  hasApprovedClaim?: boolean;
  canBook?: boolean;
  rating?: string;
  distance?: string;
  startingPrice?: string | null;
  openingStatus?: "open" | "closed" | null;
};

const callButtonClassName =
  "inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[20px] border border-[#062C21] bg-white text-[14px] font-semibold text-[#062C21] transition-colors hover:bg-[#F8FAFC]";

export function ServiceStoreCard({ serviceStore }: { serviceStore: ServiceStoreCardData }) {
  const isOpen = serviceStore.openingStatus !== "closed";
  const hasApprovedClaim = serviceStore.hasApprovedClaim ?? false;
  const phone = serviceStore.phone?.trim();

  return (
    <article className="group overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="relative">
          <ServiceShopImage
            serviceStoreId={serviceStore.id}
            serviceStoreName={serviceStore.name}
            className="h-48 md:h-52"
            previewable
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-[#0A0A0A] backdrop-blur-sm">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {serviceStore.rating ?? "4.8"}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
                isOpen ? "bg-[#0F9B76]" : "bg-[#64748B]",
              )}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
            {hasApprovedClaim ? (
              <span className="rounded-full bg-[#062C21] px-2.5 py-1 text-[11px] font-semibold text-white">
                Partner
              </span>
            ) : null}
          </div>
        </div>
      <Link href={`/browse/${serviceStore.id}`} className="block">
        <div className="p-6">
          <h3 className="text-[18px] font-semibold tracking-tight text-[#0A0A0A]">{serviceStore.name}</h3>
          <p className="mt-1 text-[14px] text-[#64748B]">{serviceStore.distance ?? "1.2 km away"}</p>
          {serviceStore.startingPrice ? (
            <p className="mt-3 text-[15px] font-semibold text-[#0A0A0A]">
              From <span className="text-[#0F9B76]">{serviceStore.startingPrice}</span>
            </p>
          ) : null}
        </div>
      </Link>
      <div className="px-6 pb-6">
        {hasApprovedClaim ? (
          <ButtonLink href={`/browse/${serviceStore.id}`} size="md" className="w-full">
            Book Now
          </ButtonLink>
        ) : phone ? (
          <a href={`tel:${phone}`} className={callButtonClassName}>
            <Phone className="size-4" />
            Call
          </a>
        ) : (
          <span className="flex h-[40px] w-full items-center justify-center rounded-[20px] bg-[#F1F5F9] text-[14px] font-semibold text-[#94A3B8]">
            Call unavailable
          </span>
        )}
      </div>
    </article>
  );
}
