import { notFound, redirect } from "next/navigation";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import {
  getMerchantAccessState,
  isMerchantUser,
} from "@/lib/merchant/access";
import {
  bookingStatusLabel,
  formatDateTime,
  formatPrice,
} from "@/lib/booking/format";
import { getCustomerBooking } from "@/lib/booking/queries";

type PageProps = {
  params: Promise<{ bookingNumber: string }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingNumber } = await params;
  const { user } = await requireDomainUser();
  const merchantAccess = await getMerchantAccessState(user.id);

  if (isMerchantUser(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    redirect("/onboarding/customer");
  }

  const booking = await getCustomerBooking(bookingNumber, customer.id);

  if (!booking) {
    notFound();
  }

  return (
    <PageShell
      title={booking.bookingNumber}
      description={formatDateTime(booking.bookingDate)}
      nav={customerNav}
      backHref="/bookings"
    >
      <div className="border-input flex flex-col gap-4 rounded-md border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-medium">{bookingStatusLabel(booking.status)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Merchant</p>
          <p>{booking.branch.merchant.name}</p>
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
    </PageShell>
  );
}
