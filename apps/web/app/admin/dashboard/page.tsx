import { AdminLayout } from "@/components/admin/admin-layout";
import { SimpleBarChart } from "@/components/reporting/simple-bar-chart";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { formatBillingCurrency } from "@/lib/billing/format";
import {
  getBillingPaidVsOutstanding,
  getBookingTrend,
  getServiceStoreGrowthMonthly,
  getMonthlyRevenueTrend,
  getPlatformDashboardCardMetrics,
} from "@/lib/reporting/queries";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [cards, booking7, booking30, monthlyRevenue, billingBalance, serviceStoreGrowth] =
    await Promise.all([
      getPlatformDashboardCardMetrics(),
      getBookingTrend(7),
      getBookingTrend(30),
      getMonthlyRevenueTrend(),
      getBillingPaidVsOutstanding(),
      getServiceStoreGrowthMonthly(),
    ]);

  const overviewCards = [
    { label: "Total Service Stores", value: cards.totalServiceStores },
    { label: "Active Service Stores", value: cards.activeServiceStores },
    { label: "Total Customers", value: cards.totalCustomers },
    { label: "Total Vehicles", value: cards.totalVehicles },
    { label: "Total Bookings", value: cards.totalBookings },
    { label: "Today's Bookings", value: cards.todaysBookings },
    { label: "Today's Revenue", value: formatBillingCurrency(cards.todaysRevenue) },
    { label: "Outstanding Billing", value: formatBillingCurrency(cards.outstandingBilling) },
    { label: "Pending Service Store Approval", value: cards.pendingServiceStoreApproval },
    { label: "Pending Billing Approval", value: cards.pendingBillingApproval },
    { label: "Pending Payment Review", value: cards.pendingPaymentReview },
  ];

  return (
    <AdminLayout
      title="Platform dashboard"
      description="Operational overview, financial trend, and growth metrics."
    >
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card) => (
          <article key={card.label} className="border-input rounded-md border p-4">
            <p className="text-muted-foreground text-xs">{card.label}</p>
            <p className="mt-1 text-lg font-semibold">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart
          title="Bookings - Last 7 Days"
          points={booking7.map((point) => ({ label: point.bucket.slice(5), value: point.count }))}
        />
        <SimpleBarChart
          title="Bookings - Last 30 Days"
          points={booking30.map((point) => ({ label: point.bucket.slice(5), value: point.count }))}
        />
        <SimpleBarChart
          title="Monthly Revenue"
          points={monthlyRevenue.map((point) => ({
            label: point.bucket,
            value: point.amount,
          }))}
          valueFormatter={(value) => formatBillingCurrency(value)}
        />
        <SimpleBarChart
          title="Service Store Growth"
          points={serviceStoreGrowth.map((point) => ({ label: point.bucket, value: point.count }))}
        />
        <SimpleBarChart
          title="Billing - Paid vs Outstanding"
          points={[
            { label: "Paid", value: billingBalance.paid },
            { label: "Outstanding", value: billingBalance.outstanding },
          ]}
          valueFormatter={(value) => formatBillingCurrency(value)}
        />
      </section>
    </AdminLayout>
  );
}
