import Link from "next/link";
import { ButtonLink } from "@/components/customer/ui/button";
import { formatPrice } from "@/lib/booking/format";

type ServiceCardProps = {
  name: string;
  duration: number;
  bufferMinutes: number;
  price: { toString(): string };
  bookHref: string;
  showPrice?: boolean;
  canBook?: boolean;
  phone?: string | null;
};

export function ServiceCard({
  name,
  duration,
  bufferMinutes,
  price,
  bookHref,
  showPrice = true,
  canBook = true,
  phone,
}: ServiceCardProps) {
  return (
    <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="h-1 bg-gradient-to-r from-[#0F9B76] to-[#5EEAD4]" />
      <div className="p-6">
        <h3 className="text-[18px] font-semibold tracking-tight text-[#0A0A0A]">{name}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#64748B]">
            {duration} min
          </span>
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#64748B]">
            +{bufferMinutes} min buffer
          </span>
          {showPrice ? (
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1.5 text-[13px] font-semibold text-[#0F9B76]">
              {formatPrice(price)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[#F1F5F9] px-6 py-4">
        {canBook ? (
          <ButtonLink href={bookHref} size="md" className="w-full">
            Book
          </ButtonLink>
        ) : phone ? (
          <a
            href={`tel:${phone}`}
            className="flex h-[40px] w-full items-center justify-center rounded-[20px] border border-[#062C21] text-[14px] font-semibold text-[#062C21]"
          >
            Call
          </a>
        ) : null}
      </div>
    </article>
  );
}
