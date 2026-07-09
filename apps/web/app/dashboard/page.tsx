import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import {
  getMerchantAccessState,
  isMerchantUser,
} from "@/lib/merchant/access";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/booking/format";
import { getCustomerForUser } from "@/lib/customer/context";
import { getCustomerDashboardMetrics } from "@/lib/reporting/queries";

export default async function DashboardPage() {
  const { session, identity } = await requireLinkedIdentity();
  const merchantAccess = await getMerchantAccessState(identity.domainUserId!);

  if (isMerchantUser(merchantAccess)) {
    redirect("/merchant");
  }

  const domainUser = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      firstName: true,
      lastName: true,
      tenant: { select: { name: true, code: true } },
    },
  });

  const customer = await getCustomerForUser(identity.domainUserId!);
  const metrics = customer ? await getCustomerDashboardMetrics(customer.id) : null;

  return (
    <PageShell
      title="Dashboard"
      description={`Signed in as ${session.user.name}`}
      nav={customerNav}
    >
      {domainUser ? (
        <div className="border-input flex flex-col gap-2 rounded-md border p-4 text-sm">
          <p>
            Profile: {domainUser.firstName} {domainUser.lastName}
          </p>
          <p>
            Tenant: {domainUser.tenant.name} ({domainUser.tenant.code})
          </p>
        </div>
      ) : null}

      {metrics ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border-input rounded-md border p-4">
            <h2 className="mb-2 text-sm font-medium">My vehicles</h2>
            {metrics.vehicles.length === 0 ? (
              <p className="text-muted-foreground text-sm">No vehicles added.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h2 className="mb-2 text-sm font-medium">Upcoming bookings</h2>
            {metrics.upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming bookings.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.upcomingBookings.map((booking) => (
                  <li key={booking.bookingNumber}>
                    {booking.bookingNumber} · {formatDateTime(booking.bookingDate)} ·{" "}
                    {booking.vehicle.licensePlate}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h2 className="mb-2 text-sm font-medium">Booking history</h2>
            {metrics.bookingHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No booking history.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.bookingHistory.slice(0, 8).map((booking) => (
                  <li key={booking.bookingNumber}>
                    {booking.bookingNumber} · {formatDateTime(booking.bookingDate)} ·{" "}
                    {booking.branch.merchant.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h2 className="mb-2 text-sm font-medium">Recent services</h2>
            {metrics.recentServices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent services.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.recentServices.map((service) => (
                  <li key={service.serviceName}>
                    {service.serviceName} · {formatDateTime(service.lastDate)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-input rounded-md border p-4 lg:col-span-2">
            <h2 className="mb-2 text-sm font-medium">Outstanding bills (future ready)</h2>
            <p className="text-muted-foreground text-sm">
              Outstanding bills: {metrics.outstandingBills}
            </p>
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/browse"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Browse merchants</p>
          <p className="text-muted-foreground">
            Find branches and book services
          </p>
        </Link>
        <Link
          href="/bookings"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">My bookings</p>
          <p className="text-muted-foreground">View your appointments</p>
        </Link>
      </div>
    </PageShell>
  );
}
