import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreCard, ServiceStoreStatusBadge, StatCard } from "@/components/service-store/ui";
import { bookingStatusLabel, formatDateTime, formatPrice } from "@/lib/booking/format";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { getServiceStoreVehicleDetail } from "@/lib/customer/queries";

type PageProps = {
  params: Promise<{ customerId: string; vehicleId: string }>;
};

export default async function ServiceStoreVehicleDetailPage({ params }: PageProps) {
  const { customerId, vehicleId } = await params;
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const data = await getServiceStoreVehicleDetail(serviceStore.id, customerId, vehicleId);

  if (!data) {
    notFound();
  }

  const { vehicle, metrics } = data;

  return (
    <PageShell
      title={vehicle.licensePlate}
      description={`${vehicle.brand} ${vehicle.model}`}
      nav={serviceStoreNav}
      backHref={`/app/customers/${customerId}`}
      backLabel="Customer"
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total spending" value={formatPrice(metrics.totalSpending)} />
        <StatCard
          label="Last wash"
          value={metrics.lastWashDate ? formatDateTime(metrics.lastWashDate) : "—"}
        />
      </section>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Vehicle details</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#8a97a5]">Province</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{vehicle.province ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Color</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{vehicle.color ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#8a97a5]">Year</dt>
            <dd className="mt-1 font-medium text-[#15202b]">{vehicle.year ?? "—"}</dd>
          </div>
          {vehicle.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-[#8a97a5]">Notes</dt>
              <dd className="mt-1 text-[#5b6b7a]">{vehicle.notes}</dd>
            </div>
          ) : null}
        </dl>
      </ServiceStoreCard>

      <ServiceStoreCard>
        <h2 className="text-sm font-semibold text-[#15202b]">Services received</h2>
        {metrics.servicesReceived.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No completed services yet.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {metrics.servicesReceived.map((service) => (
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
        <h2 className="text-sm font-semibold text-[#15202b]">Booking history</h2>
        {vehicle.bookings.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a97a5]">No bookings for this vehicle.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {vehicle.bookings.map((booking) => (
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
