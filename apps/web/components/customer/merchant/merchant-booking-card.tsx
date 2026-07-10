import { CalendarCheck, CreditCard, Star } from "lucide-react";
import { formatPrice } from "@/lib/booking/format";

type MerchantBookingCardProps = {
  startingPrice: string;
};

export function MerchantBookingCard({ startingPrice }: MerchantBookingCardProps) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#062C21] p-8 text-white shadow-[0_12px_40px_rgba(6,44,33,0.25)]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
        Starting from
      </p>
      <p className="mt-2 font-serif text-[40px] leading-none font-semibold tracking-tight">
        {formatPrice(startingPrice)}
      </p>

      <ul className="mt-8 space-y-5">
        <li className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <CalendarCheck className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[15px] font-semibold">Instant Confirmation</p>
            <p className="mt-0.5 text-[13px] text-white/60">
              Get your booking confirmed in seconds.
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <CreditCard className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[15px] font-semibold">Flexible Payment</p>
            <p className="mt-0.5 text-[13px] text-white/60">
              Pay at the shop or online when available.
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}

export function MerchantRatingBadge() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#062C21] px-3 py-1.5 text-[13px] font-semibold text-white">
        <Star className="size-3.5 fill-white" />
        4.8
      </span>
      <span className="text-[13px] font-medium text-white/80">Elite Service Provider</span>
    </div>
  );
}
