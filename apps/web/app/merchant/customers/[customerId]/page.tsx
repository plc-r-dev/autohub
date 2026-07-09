import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { formatDateTime, formatPrice } from "@/lib/booking/format";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { getMerchantCustomerDetail } from "@/lib/customer/queries";

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function MerchantCustomerDetailPage({ params }: PageProps) {
  const { customerId } = await params;
  const { merchant } = await requireApprovedMerchantUser();
  const data = await getMerchantCustomerDetail(merchant.id, customerId);

  if (!data) {
    notFound();
  }

  const { customer, metrics } = data;

  return (
    <PageShell
      title={`${customer.firstName} ${customer.lastName}`}
      description="Customer profile and CRM history"
      nav={merchantNav}
      backHref="/merchant/customers"
    >
      <div className="border-input grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
        <p>Phone: {customer.phone ?? "N/A"}</p>
        <p>Email: {customer.email ?? "N/A"}</p>
        <p>LINE display name: {customer.lineDisplayName ?? "N/A"}</p>
        <p>Total visits: {metrics.totalVisits}</p>
        <p>Total spending: {formatPrice(metrics.totalSpending)}</p>
        <p>Last visit: {metrics.lastVisit ? formatDateTime(metrics.lastVisit) : "N/A"}</p>
        <p className="sm:col-span-2">Notes: {customer.notes ?? "N/A"}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Favorite services</h2>
        {metrics.favoriteServices.length === 0 ? (
          <p className="text-muted-foreground text-sm">No completed services yet.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {metrics.favoriteServices.map((service) => (
              <li key={service.name}>
                {service.name} ({service.count})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Vehicles</h2>
        {customer.vehicles.length === 0 ? (
          <p className="text-muted-foreground text-sm">No vehicles.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {customer.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="border-input flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-muted-foreground">
                    {vehicle.province ?? "N/A"} · {vehicle.color ?? "N/A"}
                  </p>
                </div>
                <Link
                  href={`/merchant/customers/${customer.id}/vehicles/${vehicle.id}`}
                  className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                >
                  Vehicle detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Booking history</h2>
        {customer.bookings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookings.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {customer.bookings.map((booking) => (
              <div key={booking.id} className="border-input rounded-md border p-3 text-sm">
                <p className="font-medium">
                  {booking.bookingNumber} · {formatDateTime(booking.bookingDate)}
                </p>
                <p className="text-muted-foreground">
                  {booking.vehicle.licensePlate} · {booking.status}
                </p>
                <p>
                  {booking.items.map((item) => item.service.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
