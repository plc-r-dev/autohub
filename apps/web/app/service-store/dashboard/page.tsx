import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreReadinessCard } from "@/components/service-store/service-store-readiness-card";
import {
  ServiceStoreButtonLink,
  ServiceStoreCard,
  ServiceStoreStatusBadge,
  StatCard,
} from "@/components/service-store/ui";
import {
  bookingStatusLabel,
  formatDateTime,
  formatPrice,
} from "@/lib/booking/format";
import { getServiceStoreReadiness } from "@/lib/service-store/application/readiness-queries";
import { requireServiceStoreContext } from "@/lib/service-store/context";
import { roleLabel, SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";
import { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

export default async function ServiceStoreDashboardPage() {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.STORE_VIEW);

  if (ctx.serviceStore.status === "ONBOARDING") {
    redirect("/service-store/setup");
  }

  const [metrics, readiness] = await Promise.all([
    getServiceStoreDashboardMetrics(ctx.serviceStore.id),
    getServiceStoreReadiness(ctx.serviceStore.id),
  ]);

  return (
    <PageShell
      title="Dashboard"
      description={`Welcome back, ${ctx.user.firstName}`}
      nav={serviceStoreNav}
      actions={
        <ServiceStoreButtonLink href="/service-store/bookings/new">Walk-in booking</ServiceStoreButtonLink>
      }
    >
      <ServiceStoreCard className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#8a97a5] uppercase">Service Store</p>
          <h2 className="mt-1 text-xl font-semibold text-[#15202b]">{ctx.serviceStore.name}</h2>
          <p className="mt-1 text-sm text-[#5b6b7a]">
            {ctx.serviceStore.code} · {roleLabel(ctx.membership.role)}
          </p>
        </div>
        <ServiceStoreStatusBadge
          label={ctx.serviceStore.status}
          status={ctx.serviceStore.status}
        />
      </ServiceStoreCard>

      {readiness && readiness.status !== "READY" ? (
        <div className="space-y-3">
          <ServiceStoreReadinessCard readiness={readiness} />
          <p className="text-sm text-[#5b6b7a]">
            <Link href="/service-store/readiness" className="font-semibold text-[#0F9B76] hover:underline">
              View full readiness checklist
            </Link>
          </p>
        </div>
      ) : null}

      {!metrics ? (
        <p className="text-sm text-[#5b6b7a]">No service store metrics available.</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Today's bookings" value={metrics.todaysBookings} />
            <StatCard label="Today's revenue" value={formatPrice(metrics.todaysRevenue)} />
            <StatCard label="Pending" value={metrics.statusCount.PENDING} />
            <StatCard
              label="Outstanding billing"
              value={formatPrice(metrics.outstandingBilling)}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="In progress" value={metrics.statusCount.IN_PROGRESS} />
            <StatCard label="Completed" value={metrics.statusCount.COMPLETED} />
            <StatCard label="No show" value={metrics.statusCount.NO_SHOW} />
            <StatCard label="Cancelled" value={metrics.statusCount.CANCELLED} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ServiceStoreCard>
              <h3 className="text-sm font-semibold text-[#15202b]">Recent bookings</h3>
              {metrics.recentBookings.length === 0 ? (
                <p className="mt-4 text-sm text-[#8a97a5]">No recent bookings.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {metrics.recentBookings.map((booking) => (
                    <Link
                      key={booking.bookingNumber}
                      href={`/service-store/bookings/${booking.bookingNumber}`}
                      className="rounded-xl border border-[#eef3f7] p-3 text-sm transition-colors hover:bg-[#f4f7fa]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#15202b]">{booking.bookingNumber}</p>
                        <ServiceStoreStatusBadge
                          label={bookingStatusLabel(booking.status)}
                          status={booking.status}
                        />
                      </div>
                      <p className="mt-1 text-[#5b6b7a]">
                        {booking.customer.firstName} {booking.customer.lastName}
                      </p>
                      <p className="text-xs text-[#8a97a5]">
                        {booking.branch.name} · {formatDateTime(booking.bookingDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </ServiceStoreCard>

            <ServiceStoreCard>
              <h3 className="text-sm font-semibold text-[#15202b]">Upcoming bookings</h3>
              {metrics.upcomingBookings.length === 0 ? (
                <p className="mt-4 text-sm text-[#8a97a5]">No upcoming bookings.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {metrics.upcomingBookings.map((booking) => (
                    <Link
                      key={booking.bookingNumber}
                      href={`/service-store/bookings/${booking.bookingNumber}`}
                      className="rounded-xl border border-[#eef3f7] p-3 text-sm transition-colors hover:bg-[#f4f7fa]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#15202b]">{booking.bookingNumber}</p>
                        <ServiceStoreStatusBadge
                          label={bookingStatusLabel(booking.status)}
                          status={booking.status}
                        />
                      </div>
                      <p className="mt-1 text-[#5b6b7a]">
                        {booking.customer.firstName} {booking.customer.lastName}
                      </p>
                      <p className="text-xs text-[#8a97a5]">
                        {booking.branch.name} · {formatDateTime(booking.bookingDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </ServiceStoreCard>

            <ServiceStoreCard>
              <h3 className="text-sm font-semibold text-[#15202b]">Top services (30 days)</h3>
              {metrics.topServices.length === 0 ? (
                <p className="mt-4 text-sm text-[#8a97a5]">No completed service data.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {metrics.topServices.map((service) => (
                    <li
                      key={service.serviceName}
                      className="flex justify-between gap-4 border-b border-[#eef3f7] pb-2 last:border-0"
                    >
                      <span className="text-[#15202b]">{service.serviceName}</span>
                      <span className="font-semibold text-[#5b6b7a]">{service.qty}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ServiceStoreCard>

            <ServiceStoreCard>
              <h3 className="text-sm font-semibold text-[#15202b]">Recent customers</h3>
              {metrics.recentCustomers.length === 0 ? (
                <p className="mt-4 text-sm text-[#8a97a5]">No recent customers.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {metrics.recentCustomers.map((customer) => (
                    <li key={customer.customerId}>
                      <Link
                        href={`/service-store/customers/${customer.customerId}`}
                        className="flex justify-between gap-4 rounded-lg px-1 py-1 hover:bg-[#f4f7fa]"
                      >
                        <span className="font-medium text-[#15202b]">
                          {customer.firstName} {customer.lastName}
                        </span>
                        <span className="text-xs text-[#8a97a5]">
                          {formatDateTime(customer.lastBookingDate)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </ServiceStoreCard>
          </section>
        </>
      )}
    </PageShell>
  );
}
