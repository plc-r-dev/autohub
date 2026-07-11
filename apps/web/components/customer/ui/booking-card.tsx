import Link from "next/link";
import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { formatBookingDate, formatBookingTime } from "@/lib/booking/format";
import { ChevronRight } from "lucide-react";

export type BookingCardData = {
  bookingNumber: string;
  serviceStoreName: string;
  bookingDate: Date | string;
  vehiclePlate: string;
  status: string;
};

export function BookingCard({ booking }: { booking: BookingCardData }) {
  return (
    <Link
      href={`/bookings/${booking.bookingNumber}`}
      className="group block overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-semibold tracking-tight text-[#0A0A0A]">
            {booking.serviceStoreName}
          </p>
          <p className="mt-1 text-[13px] text-[#94A3B8]">{booking.bookingNumber}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[#F1F5F9] pt-5">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">Date</p>
          <p className="mt-1 text-[14px] font-medium text-[#0A0A0A]">
            {formatBookingDate(booking.bookingDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">Time</p>
          <p className="mt-1 text-[14px] font-medium text-[#0A0A0A]">
            {formatBookingTime(booking.bookingDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">Vehicle</p>
          <p className="mt-1 truncate text-[14px] font-medium text-[#0A0A0A]">
            {booking.vehiclePlate}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-[14px] font-semibold text-[#0F9B76]">
        View details
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
