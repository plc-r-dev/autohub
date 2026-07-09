import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { MerchantBookingActions } from "@/components/booking/merchant-booking-actions";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import {
  bookingStatusLabel,
  formatDateTime,
  formatPrice,
} from "@/lib/booking/format";
import { getMerchantBooking } from "@/lib/booking/queries";

type PageProps = {
  params: Promise<{ bookingNumber: string }>;
};

export default async function MerchantBookingDetailPage({ params }: PageProps) {
  const { bookingNumber } = await params;
  const { merchant } = await requireApprovedMerchantUser();

  const booking = await getMerchantBooking(bookingNumber, merchant.id);

  if (!booking) {
    notFound();
  }

  return (
    <PageShell
      title={booking.bookingNumber}
      description={formatDateTime(booking.bookingDate)}
      nav={merchantNav}
      backHref="/merchant/bookings"
    >
      <div className="border-input flex flex-col gap-4 rounded-md border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-medium">{bookingStatusLabel(booking.status)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Customer</p>
          <p>
            {booking.customer.firstName} {booking.customer.lastName}
            {booking.customer.isWalkIn ? " (walk-in)" : ""}
          </p>
          {booking.customer.phone ? <p>{booking.customer.phone}</p> : null}
        </div>
        <div>
          <p className="text-muted-foreground">Branch</p>
          <p>{booking.branch.name}</p>
          {booking.branch.address ? <p>{booking.branch.address}</p> : null}
        </div>
        <div>
          <p className="text-muted-foreground">Vehicle</p>
          <p>
            {booking.vehicle.licensePlate} · {booking.vehicle.brand} {booking.vehicle.model}
          </p>
          {booking.vehicle.province ? <p>{booking.vehicle.province}</p> : null}
        </div>
        <div>
          <p className="text-muted-foreground">Services</p>
          <ul className="list-disc pl-5">
            {booking.items.map((item) => (
              <li key={item.id}>
                {item.service.name} ({item.service.duration} min) ·{" "}
                {formatPrice(item.unitPrice)} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        {booking.note ? (
          <div>
            <p className="text-muted-foreground">Note</p>
            <p>{booking.note}</p>
          </div>
        ) : null}
        <BookingTimeline
          confirmedAt={booking.confirmedAt}
          startedAt={booking.startedAt}
          completedAt={booking.completedAt}
          cancelledAt={booking.cancelledAt}
          noShowAt={booking.noShowAt}
        />
      </div>

      <MerchantBookingActions
        bookingNumber={booking.bookingNumber}
        status={booking.status}
      />
    </PageShell>
  );
}
