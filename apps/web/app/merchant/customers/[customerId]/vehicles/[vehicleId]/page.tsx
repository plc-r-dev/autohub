import { notFound } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { formatDateTime, formatPrice } from "@/lib/booking/format";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { getMerchantVehicleDetail } from "@/lib/customer/queries";

type PageProps = {
  params: Promise<{ customerId: string; vehicleId: string }>;
};

export default async function MerchantVehicleDetailPage({ params }: PageProps) {
  const { customerId, vehicleId } = await params;
  const { merchant } = await requireApprovedMerchantUser();
  const data = await getMerchantVehicleDetail(merchant.id, customerId, vehicleId);

  if (!data) {
    notFound();
  }

  const { vehicle, metrics } = data;

  return (
    <PageShell
      title={vehicle.licensePlate}
      description={`${vehicle.brand} ${vehicle.model}`}
      nav={merchantNav}
      backHref={`/merchant/customers/${customerId}`}
    >
      <div className="border-input grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
        <p>Province: {vehicle.province ?? "N/A"}</p>
        <p>Color: {vehicle.color ?? "N/A"}</p>
        <p>Year: {vehicle.year ?? "N/A"}</p>
        <p>Total spending: {formatPrice(metrics.totalSpending)}</p>
        <p>Last wash date: {metrics.lastWashDate ? formatDateTime(metrics.lastWashDate) : "N/A"}</p>
        <p className="sm:col-span-2">Notes: {vehicle.notes ?? "N/A"}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Services received</h2>
        {metrics.servicesReceived.length === 0 ? (
          <p className="text-muted-foreground text-sm">No completed services yet.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {metrics.servicesReceived.map((service) => (
              <li key={service.name}>
                {service.name} ({service.count})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Booking history</h2>
        {vehicle.bookings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookings for this vehicle.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {vehicle.bookings.map((booking) => (
              <div key={booking.id} className="border-input rounded-md border p-3 text-sm">
                <p className="font-medium">
                  {booking.bookingNumber} · {formatDateTime(booking.bookingDate)}
                </p>
                <p className="text-muted-foreground">{booking.status}</p>
                <p>{booking.items.map((item) => item.service.name).join(", ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
