import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import {
  bookingStatusLabel,
  formatDateTime,
  formatPrice,
} from "@/lib/booking/format";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isPendingMerchant,
} from "@/lib/merchant/access";
import { prisma } from "@/lib/prisma";
import { getMerchantDashboardMetrics } from "@/lib/reporting/queries";

export default async function MerchantDashboardPage() {
  const { session, identity } = await requireLinkedIdentity();
  const merchantAccess = await getMerchantAccessState(identity.domainUserId!);

  if (isPendingMerchant(merchantAccess)) {
    redirect("/merchant/waiting");
  }

  if (!isApprovedMerchant(merchantAccess)) {
    redirect("/dashboard");
  }

  const domainUser = await prisma.user.findUnique({
    where: { id: identity.domainUserId! },
    select: {
      firstName: true,
      lastName: true,
      merchant: { select: { id: true, name: true, code: true, status: true } },
      tenant: { select: { name: true, code: true } },
    },
  });

  const metrics = domainUser?.merchant
    ? await getMerchantDashboardMetrics(domainUser.merchant.id)
    : null;

  return (
    <PageShell
      title="Merchant dashboard"
      description={`Signed in as ${session.user.name}`}
      nav={merchantNav}
    >
      {domainUser?.merchant ? (
        <div className="border-input flex flex-col gap-2 rounded-md border p-4 text-sm">
          <p>
            Profile: {domainUser.firstName} {domainUser.lastName}
          </p>
          <p>
            Merchant: {domainUser.merchant.name} ({domainUser.merchant.code})
          </p>
          <p>Status: {domainUser.merchant.status}</p>
          <p>
            Tenant: {domainUser.tenant.name} ({domainUser.tenant.code})
          </p>
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Today&apos;s performance</h2>
            <p className="text-muted-foreground text-sm">
              Track operations and revenue in real time.
            </p>
          </div>
          <Link
            href="/merchant/bookings/new"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center rounded-4xl px-3 text-sm font-medium"
          >
            Walk-in booking
          </Link>
        </div>

        {!metrics ? (
          <p className="text-muted-foreground text-sm">No merchant metrics available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Today&apos;s bookings</p>
              <p className="text-lg font-semibold">{metrics.todaysBookings}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Today&apos;s revenue</p>
              <p className="text-lg font-semibold">{formatPrice(metrics.todaysRevenue)}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Pending bookings</p>
              <p className="text-lg font-semibold">{metrics.statusCount.PENDING}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Outstanding billing</p>
              <p className="text-lg font-semibold">{formatPrice(metrics.outstandingBilling)}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">In progress</p>
              <p className="text-lg font-semibold">{metrics.statusCount.IN_PROGRESS}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Completed</p>
              <p className="text-lg font-semibold">{metrics.statusCount.COMPLETED}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">No show</p>
              <p className="text-lg font-semibold">{metrics.statusCount.NO_SHOW}</p>
            </article>
            <article className="border-input rounded-md border p-4">
              <p className="text-muted-foreground text-xs">Cancelled</p>
              <p className="text-lg font-semibold">{metrics.statusCount.CANCELLED}</p>
            </article>
          </div>
        )}
      </section>

      {metrics ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border-input rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Recent bookings</h3>
            {metrics.recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent bookings.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {metrics.recentBookings.map((booking) => (
                  <Link
                    key={booking.bookingNumber}
                    href={`/merchant/bookings/${booking.bookingNumber}`}
                    className="border-input hover:bg-muted rounded-md border p-3 text-sm"
                  >
                    <p className="font-medium">{booking.bookingNumber}</p>
                    <p>
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {booking.branch.name} · {formatDateTime(booking.bookingDate)} ·{" "}
                      {bookingStatusLabel(booking.status)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Upcoming bookings</h3>
            {metrics.upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming bookings.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {metrics.upcomingBookings.map((booking) => (
                  <Link
                    key={booking.bookingNumber}
                    href={`/merchant/bookings/${booking.bookingNumber}`}
                    className="border-input hover:bg-muted rounded-md border p-3 text-sm"
                  >
                    <p className="font-medium">{booking.bookingNumber}</p>
                    <p>
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {booking.branch.name} · {formatDateTime(booking.bookingDate)} ·{" "}
                      {bookingStatusLabel(booking.status)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Top services (30 days)</h3>
            {metrics.topServices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No completed service data.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.topServices.map((service) => (
                  <li key={service.serviceName}>
                    {service.serviceName} ({service.qty})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-input rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Recent customers</h3>
            {metrics.recentCustomers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent customers.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {metrics.recentCustomers.map((customer) => (
                  <li key={customer.customerId}>
                    {customer.firstName} {customer.lastName} ·{" "}
                    {formatDateTime(customer.lastBookingDate)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/merchant/profile"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Merchant profile</p>
          <p className="text-muted-foreground">Update business information</p>
        </Link>
        <Link
          href="/merchant/branches"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Branches & services</p>
          <p className="text-muted-foreground">Manage locations and offerings</p>
        </Link>
        <Link
          href="/merchant/bookings"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">All bookings</p>
          <p className="text-muted-foreground">View and manage every appointment</p>
        </Link>
        <Link
          href="/merchant/customers"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Customers</p>
          <p className="text-muted-foreground">Search customers and vehicle history</p>
        </Link>
        <Link
          href="/merchant/billings"
          className="border-input hover:bg-muted rounded-md border p-4 text-sm"
        >
          <p className="font-medium">Billings</p>
          <p className="text-muted-foreground">Submit billing and payment slips</p>
        </Link>
      </div>
    </PageShell>
  );
}
