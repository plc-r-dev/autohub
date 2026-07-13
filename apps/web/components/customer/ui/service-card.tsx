import { ArrowRight, Clock } from "lucide-react";
import { ButtonLink } from "@/components/customer/ui/button";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { formatPrice } from "@/lib/booking/format";
import { cn } from "@workspace/ui/lib/utils";

type ServiceCardProps = {
  name: string;
  duration: number;
  price: { toString(): string };
  bookHref: string;
  canBook?: boolean;
  /** Service image, sourced via ServiceShopImage. Omit to render without an image. */
  serviceStoreId?: string;
  imageSeed?: string;
  imageSlot?: number;
};

/**
 * The card is not a link — "Book Now" (ButtonLink, system primary color) is
 * the one explicit action, leaving room for other card-level actions
 * (favorite, share, compare) later without them fighting a whole-card tap
 * target. Row layout on mobile (booking-app menu feel), column layout on
 * desktop (catalog tile feel) via flex-direction, not two components.
 */
export function ServiceCard({
  name,
  duration,
  price,
  bookHref,
  canBook = true,
  serviceStoreId,
  imageSeed,
  imageSlot,
}: ServiceCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-row overflow-hidden rounded-[20px] bg-white ring-1 ring-black/[0.04] transition-all duration-200 md:flex-col",
        canBook
          ? "hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(0,0,0,0.09)] hover:ring-[#16A34A]/30"
          : "opacity-60",
      )}
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden sm:w-32 md:aspect-[4/3] md:w-full">
        {serviceStoreId ? (
          <ServiceShopImage
            serviceStoreId={serviceStoreId}
            serviceStoreName={imageSeed ?? name}
            slot={imageSlot}
            className="h-full"
            imageClassName="transition-transform duration-300 md:group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 45vw, 112px"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-[#16A34A] to-[#166534]" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-4 md:block md:p-5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#0F172A] md:text-[17px]">
            {name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#64748B]">
            <Clock className="size-3.5 shrink-0" />
            <span>{duration} min</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="text-[15px] font-bold text-[#16A34A] md:text-[18px]">
              {formatPrice(price)}
            </span>
          </div>

          {canBook ? (
            <ButtonLink
              href={bookHref}
              variant="primary"
              size="md"
              aria-label={`Book ${name}`}
              className="mt-4 hidden w-full md:flex"
            >
              Book Now
              <ArrowRight className="size-4" />
            </ButtonLink>
          ) : null}
        </div>

        <div className="shrink-0 md:hidden">
          {canBook ? (
            <ButtonLink href={bookHref} variant="primary" size="sm" aria-label={`Book ${name}`}>
              Book
              <ArrowRight className="size-3.5" />
            </ButtonLink>
          ) : (
            <span className="text-[11px] font-medium whitespace-nowrap text-[#94A3B8]">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
