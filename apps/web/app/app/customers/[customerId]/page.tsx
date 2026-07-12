import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import {
  ServiceStoreButtonLink,
  ServiceStoreCard,
  ServiceStoreStatusBadge,
  StatCard,
} from "@/components/service-store/ui";
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { getServiceStoreCustomerDetail } from "@/lib/customer/queries";

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function ServiceStoreCustomerDetailPage({ params }: PageProps) {
  const { customerId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const data = await getServiceStoreCustomerDetail(serviceStore.id, customerId);

  if (!data) {
    notFound();
  }

  const { customer, metrics } = data;

  return (
    <PageShell
      title={`${customer.firstName} ${customer.lastName}`}
      description="Customer profile and visit history"
      nav={serviceStoreNav}
      backHref="/app/customers"
      backLabel="Customers"
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" value={metrics.totalVisits} />
        <StatCard label="Total spending" value={formatPrice(metrics.totalSpending)} />
        <StatCard
          label="Last visit"
          value={metrics.lastVisit ? formatDateTime(metrics.lastVisit) : "—"}
        />
      </section>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Contact</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#8a97a5]">Phone</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{customer.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Email</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{customer.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">LINE display name</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{customer.lineDisplayName ?? "—"}</dd>
          </div>
          {customer.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-[#8a97a5]">Notes</dt>
              <dd className="mt-1 text-[#5b6b7a]">{customer.notes}</dd>
            </div>
          ) : null}
        </dl>
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Favorite services</h2>
        {metrics.favoriteServices.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No completed services yet.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {metrics.favoriteServices.map((service) => (
              <li
                key={service.name}
                className="flex justify-between gap-4 border-b border-[#eef3f7] pb-2 last:border-0"
              >
                <span className="text-[#15202b]">{service.name}</span>
                <span className="font-semibold text-[#5b6b7a]">{service.count}</span>
              </li>
            ))}
          </ul>
        )}
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Vehicles</h2>
        {customer.vehicles.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No vehicles on file.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {customer.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#eef3f7] p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#15202b]">
                    {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="mt-0.5 text-[#8a97a5]">
                    {vehicle.province ?? "—"} · {vehicle.color ?? "—"}
                  </p>
                </div>
                <ServiceStoreButtonLink
                  href={`/app/customers/${customer.id}/vehicles/${vehicle.id}`}
                  variant="secondary"
                >
                  View
                </ServiceStoreButtonLink>
              </div>
            ))}
          </div>
        )}
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Booking history</h2>
        {customer.bookings.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No bookings yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {customer.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/app/bookings/${booking.bookingNumber}`}
                className="rounded-xl border border-[#eef3f7] p-3 text-sm transition-colors hover:bg-[#f4f7fa]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#15202b]">{booking.bookingNumber}</p>
                  <ServiceStoreStatusBadge
                    label={bookingStatusLabel(booking.status)}
                    status={booking.status}
                  />
                </div>
                <p className="mt-1 text-[#5b6b7a]">{formatDateTime(booking.bookingDate)}</p>
                <p className="text-[#8a97a5]">
                  {booking.vehicle.licensePlate} ·{" "}
                  {booking.items.map((item) => item.service.name).join(", ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </ServiceStoreCard>
    </PageShell>
  );
}
