import { ButtonLink, Card } from "@/components/customer/ui";
import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { formatBookingDate, formatBookingTime, formatPrice } from "@/lib/booking/format";
import { formatVehicleSelectLabel } from "@/lib/customer/vehicle-format";
import { CheckCircle2 } from "lucide-react";

export type BookingSuccessService = {
  name: string;
  duration: number;
  price: string | number;
};

type BookingSuccessPanelProps = {
  bookingNumber: string;
  bookingStatus?: string;
  serviceStoreName: string;
  branchName?: string;
  bookingDate: Date | string;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  services: BookingSuccessService[];
  totalPrice: number;
};

function formatSummaryValue(
  value: Date | string | null | undefined,
  formatter: (value: Date | string) => string,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatter(value);
}

export function BookingSuccessPanel({
  bookingNumber,
  bookingStatus = "PENDING",
  serviceStoreName,
  branchName,
  bookingDate,
  vehicle,
  services,
  totalPrice,
}: BookingSuccessPanelProps) {
  const dateLabel = formatSummaryValue(bookingDate, formatBookingDate);
  const timeLabel = formatSummaryValue(bookingDate, formatBookingTime);
  const vehicleLabel = formatVehicleSelectLabel(vehicle);

  return (
    <Card padding={false}>
      <div className="px-6 py-12 text-center md:px-10">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#ECFDF5]">
          <CheckCircle2 className="size-10 text-[#0F9B76]" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-[32px] font-semibold tracking-tight text-[#0A0A0A]">
          You&apos;re booked
        </h2>
        <p className="mt-2 text-[16px] text-[#64748B]">Your appointment is confirmed</p>

        <p className="mt-10 text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
          Booking number
        </p>
        <p className="mt-1 text-[28px] font-semibold tracking-tight text-[#0A0A0A]">
          {bookingNumber}
        </p>
        <div className="mt-4 flex justify-center">
          <BookingStatusBadge status={bookingStatus} />
        </div>

        <div className="mt-8 space-y-6 rounded-[20px] bg-[#F8FAFC] p-6 text-left">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
              Service shop
            </p>
            <p className="mt-2 text-[18px] font-semibold text-[#0A0A0A]">{serviceStoreName}</p>
            {branchName ? (
              <p className="mt-1 text-[14px] text-[#64748B]">{branchName}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#E2E8F0] pt-6">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
                Date
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#0A0A0A]">{dateLabel}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
                Time
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#0A0A0A]">{timeLabel}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
                Vehicle
              </p>
              <p className="mt-2 text-[14px] font-medium text-[#0A0A0A]">{vehicleLabel}</p>
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-6">
            <p className="text-[11px] font-semibold tracking-widest text-[#94A3B8] uppercase">
              Services
            </p>
            <ul className="mt-4 space-y-4">
              {services.map((service) => (
                <li
                  key={`${service.name}-${service.duration}`}
                  className="flex items-start justify-between gap-4 text-[15px]"
                >
                  <span>
                    <span className="font-medium text-[#0A0A0A]">{service.name}</span>
                    <span className="mt-0.5 block text-[13px] text-[#64748B]">
                      {service.duration} min
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-[#0A0A0A]">
                    {formatPrice(service.price)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-[17px] font-semibold">
              <span className="text-[#0A0A0A]">Total</span>
              <span className="text-[#0F9B76]">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#F1F5F9] p-6">
        <ButtonLink href="/bookings">View My Bookings</ButtonLink>
        <ButtonLink href="/browse?nearby=1" variant="secondary">
          Back to Nearby Stores
        </ButtonLink>
      </div>
    </Card>
  );
}
