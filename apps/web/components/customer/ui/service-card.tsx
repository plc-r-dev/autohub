import { ButtonLink } from "@/components/customer/ui/button";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { formatPrice } from "@/lib/booking/format";

type ServiceCardProps = {
  name: string;
  duration: number;
  bufferMinutes?: number;
  price: { toString(): string };
  bookHref: string;
  showPrice?: boolean;
  canBook?: boolean;
  description?: string;
  /** Service image, sourced via ServiceShopImage. Omit to render without an image. */
  serviceStoreId?: string;
  imageSeed?: string;
  imageSlot?: number;
};

/**
 * Service-only card: name, description, duration, price, and the Book Now
 * CTA. Deliberately carries no store-level metadata (phone, address, etc.)
 * — that information belongs on the page header, not this card.
 */
export function ServiceCard({
  name,
  duration,
  bufferMinutes,
  price,
  bookHref,
  showPrice = true,
  canBook = true,
  description,
  serviceStoreId,
  imageSeed,
  imageSlot,
}: ServiceCardProps) {
  return (
    <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {serviceStoreId ? (
        <div className="relative h-40 w-full overflow-hidden">
          <ServiceShopImage
            serviceStoreId={serviceStoreId}
            serviceStoreName={imageSeed ?? name}
            slot={imageSlot}
            className="h-full"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      ) : (
        <div className="h-1 bg-gradient-to-r from-[#0F9B76] to-[#5EEAD4]" />
      )}
      <div className="p-6">
        <h3 className="text-[18px] font-semibold tracking-tight text-[#0A0A0A]">{name}</h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-[13px] text-[#64748B]">{description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#64748B]">
            {duration} min
          </span>
          {bufferMinutes != null ? (
            <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#64748B]">
              +{bufferMinutes} min buffer
            </span>
          ) : null}
          {showPrice ? (
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1.5 text-[13px] font-semibold text-[#0F9B76]">
              {formatPrice(price)}
            </span>
          ) : null}
        </div>
      </div>
      {canBook ? (
        <div className="border-t border-[#F1F5F9] px-6 py-4">
          <ButtonLink href={bookHref} size="md" className="w-full">
            Book Now
          </ButtonLink>
        </div>
      ) : null}
    </article>
  );
}
