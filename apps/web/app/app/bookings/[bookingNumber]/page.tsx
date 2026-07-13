import { CustomerDetailLink } from "@/components/customers/customer-detail-link";
import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { ServiceStoreBookingActions } from "@/components/booking/service-store-booking-actions";
import { ServiceStoreCard, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format";
import { getServiceStoreBooking } from "@/lib/booking/queries";

type PageProps = {
  params: Promise<{ bookingNumber: string }>;
};

export default async function ServiceStoreBookingDetailPage({ params }: PageProps) {
  const { bookingNumber } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const booking = await getServiceStoreBooking(bookingNumber, serviceStore.id);

  if (!booking) {
    notFound();
  }

  const totalPrice = booking.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  return (
    <PageShell
      title={booking.bookingNumber}
      description={formatDateTime(booking.bookingDate)}
      nav={serviceStoreNav}
      backHref="/app/bookings"
      backLabel="Bookings"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ServiceStoreCard className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#0F172A]">Booking details</h2>
            <ServiceStoreStatusBadge
              label={bookingStatusLabel(booking.status)}
              status={booking.status}
            />
          </div>

          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-[#8a97a5]">Customer</dt>
              <dd className="mt-1 font-medium text-[#0F172A]">
                <CustomerDetailLink customerId={booking.customer.id}>
                  {booking.customer.firstName} {booking.customer.lastName}
                </CustomerDetailLink>
                {booking.customer.isWalkIn ? " (walk-in)" : ""}
              </dd>
              {booking.customer.phone ? (
                <dd className="text-[#5b6b7a]">{booking.customer.phone}</dd>
              ) : null}
            </div>
            <div>
              <dt className="text-[#8a97a5]">Branch</dt>
              <dd className="mt-1 font-medium text-[#0F172A]">{booking.branch.name}</dd>
              {booking.branch.address ? (
                <dd className="text-[#5b6b7a]">{booking.branch.address}</dd>
              ) : null}
            </div>
            <div>
              <dt className="text-[#8a97a5]">Vehicle</dt>
              <dd className="mt-1 font-medium text-[#0F172A]">
                {booking.vehicle.licensePlate} · {booking.vehicle.brand} {booking.vehicle.model}
              </dd>
            </div>
          </dl>
        </ServiceStoreCard>

        <ServiceStoreCard className="space-y-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Services</h2>
          <ul className="space-y-3 text-sm">
            {booking.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 border-b border-[#eef3f7] pb-3 last:border-0">
                <span>
                  <span className="font-medium text-[#0F172A]">{item.service.name}</span>
                  <span className="mt-0.5 block text-[#8a97a5]">{item.service.duration} min</span>
                </span>
                <span className="font-semibold">{formatPrice(item.unitPrice)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-[#eef3f7] pt-4 text-base font-semibold">
            <span>Total</span>
            <span className="text-[#16A34A]">{formatPrice(totalPrice)}</span>
          </div>
          {booking.note ? (
            <p className="rounded-xl bg-[#f4f7fa] p-3 text-sm text-[#5b6b7a]">{booking.note}</p>
          ) : null}
        </ServiceStoreCard>
      </div>

      <ServiceStoreCard>
        <BookingTimeline
          status={booking.status}
          confirmedAt={booking.confirmedAt}
          startedAt={booking.startedAt}
          completedAt={booking.completedAt}
          cancelledAt={booking.cancelledAt}
          noShowAt={booking.noShowAt}
        />
      </ServiceStoreCard>

      <ServiceStoreBookingActions bookingNumber={booking.bookingNumber} status={booking.status} />
    </PageShell>
  );
}
