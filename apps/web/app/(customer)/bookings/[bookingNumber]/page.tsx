import { notFound, redirect } from "next/navigation";
import { BookingSuccessPanel } from "@/components/booking/booking-success-panel";
import { CustomerShell } from "@/components/customer/customer-shell";
import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { Card, Timeline } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import { formatBookingDate, formatBookingTime, formatPrice } from "@/lib/booking/format";
import { getCustomerBooking } from "@/lib/booking/queries";
import { Navigation, Phone } from "lucide-react";

type PageProps = {
  params: Promise<{ bookingNumber: string }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingNumber } = await params;
  const { user } = await requireDomainUser();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) redirect("/browse");

  const booking = await getCustomerBooking(bookingNumber, customer.id);
  if (!booking) notFound();

  const totalPrice = booking.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  const showSuccess = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const phone = booking.branch.serviceStore.phone;
  const mapsQuery = booking.branch.address ?? booking.branch.serviceStore.name;
  const canCancelHint =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <CustomerShell backHref="/bookings" backLabel="Bookings">
      <div className="flex flex-col gap-6">
        {showSuccess ? (
          <BookingSuccessPanel
            bookingNumber={booking.bookingNumber}
            bookingStatus={booking.status}
            serviceStoreName={booking.branch.serviceStore.name}
            branchName={booking.branch.name}
            bookingDate={booking.bookingDate}
            vehicle={{
              licensePlate: booking.vehicle.licensePlate,
              brand: booking.vehicle.brand,
              model: booking.vehicle.model,
            }}
            services={booking.items.map((item) => ({
              name: item.service.name,
              duration: item.service.duration,
              price: Number(item.unitPrice),
            }))}
            totalPrice={totalPrice}
          />
        ) : (
          <>
            <div>
              <p className="text-[14px] text-[#94A3B8]">{booking.bookingNumber}</p>
              <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-[#0F172A]">
                Booking details
              </h1>
            </div>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[18px] font-semibold text-[#0F172A]">
                    {booking.branch.serviceStore.name}
                  </p>
                  <p className="mt-1 text-[14px] text-[#64748B]">{booking.branch.name}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                    Date
                  </p>
                  <p className="mt-1 font-medium">{formatBookingDate(booking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                    Time
                  </p>
                  <p className="mt-1 font-medium">{formatBookingTime(booking.bookingDate)}</p>
                </div>
              </div>
            </Card>

            <Timeline
              status={booking.status}
              confirmedAt={booking.confirmedAt}
              startedAt={booking.startedAt}
              completedAt={booking.completedAt}
              cancelledAt={booking.cancelledAt}
              noShowAt={booking.noShowAt}
            />

            <Card>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                Vehicle
              </p>
              <p className="mt-2 text-[22px] font-semibold">{booking.vehicle.licensePlate}</p>
              <p className="mt-1 text-[14px] text-[#64748B]">
                {booking.vehicle.brand} {booking.vehicle.model}
              </p>
            </Card>

            <Card>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                Services
              </p>
              <ul className="mt-4 space-y-4">
                {booking.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-[15px]">
                    <span>
                      {item.service.name}
                      <span className="block text-[13px] text-[#64748B]">
                        {item.service.duration} min
                      </span>
                    </span>
                    <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-between border-t border-[#F1F5F9] pt-4 text-[17px] font-semibold">
                <span>Total</span>
                <span className="text-[#16A34A]">{formatPrice(totalPrice)}</span>
              </div>
            </Card>

            {booking.branch.address ? (
              <Card padding={false}>
                <div className="flex h-44 items-center justify-center bg-[#F1F5F9] text-[14px] text-[#94A3B8]">
                  Map preview
                </div>
              </Card>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[20px] bg-[#16A34A] text-[15px] font-semibold text-white"
                >
                  <Phone className="size-4" />
                  Call service shop
                </a>
              ) : null}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[20px] border border-[#E2E8F0] bg-white text-[15px] font-semibold text-[#0F172A]"
              >
                <Navigation className="size-4" />
                Navigate
              </a>
            </div>

            {canCancelHint ? (
              <p className="text-center text-[14px] text-[#64748B]">
                Need to cancel? Contact the service shop directly.
              </p>
            ) : null}
          </>
        )}
      </div>
    </CustomerShell>
  );
}
