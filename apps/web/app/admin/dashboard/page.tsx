import { AdminDashboardTabs } from "@/components/admin/admin-dashboard-tabs"
import { AdminLayout } from "@/components/admin/admin-layout"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { formatBillingCurrency } from "@/lib/billing/format"
import {
  getAdminRecentActivity,
  getAdminSystemAlerts,
  getAdminTodoTaskCards,
} from "@/lib/reporting/admin-dashboard"
import {
  getBillingPaidVsOutstanding,
  getBookingTrend,
  getMonthlyRevenueTrend,
  getPlatformDashboardCardMetrics,
  getServiceStoreGrowthMonthly,
} from "@/lib/reporting/queries"

type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  await requireAdminSession()
  const params = await searchParams
  const initialTab = params.tab === "kpi" ? "kpi" : "todo"

  const [
    cards,
    booking7,
    booking30,
    monthlyRevenue,
    billingBalance,
    serviceStoreGrowth,
    tasks,
    activity,
    alerts,
  ] = await Promise.all([
    getPlatformDashboardCardMetrics(),
    getBookingTrend(7),
    getBookingTrend(30),
    getMonthlyRevenueTrend(),
    getBillingPaidVsOutstanding(),
    getServiceStoreGrowthMonthly(),
    getAdminTodoTaskCards(),
    getAdminRecentActivity(),
    getAdminSystemAlerts(),
  ])

  return (
    <AdminLayout
      title="Platform dashboard"
      description="Operations workspace and executive KPIs."
    >
      <AdminDashboardTabs
        initialTab={initialTab}
        todo={{
          tasks,
          activity,
          alerts,
        }}
        kpi={{
          store: [
            { label: "Total Service Stores", value: cards.totalServiceStores },
            { label: "Active Service Stores", value: cards.activeServiceStores },
            { label: "Suspended Stores", value: cards.suspendedServiceStores },
          ],
          customer: [
            { label: "Total Customers", value: cards.totalCustomers },
            { label: "Total Vehicles", value: cards.totalVehicles },
          ],
          operations: [
            { label: "Today's Bookings", value: cards.todaysBookings },
            {
              label: "Today's Revenue",
              value: formatBillingCurrency(cards.todaysRevenue),
            },
            {
              label: "Outstanding Billing",
              value: formatBillingCurrency(cards.outstandingBilling),
            },
          ],
          bookingTrend7: booking7.map((point) => ({
            label: point.bucket.slice(5),
            value: point.count,
          })),
          bookingTrend30: booking30.map((point) => ({
            label: point.bucket.slice(5),
            value: point.count,
          })),
          revenueTrend: monthlyRevenue.map((point) => ({
            label: point.bucket,
            value: point.amount,
          })),
          storeGrowth: serviceStoreGrowth.map((point) => ({
            label: point.bucket,
            value: point.count,
          })),
          billingStatus: [
            { label: "Paid", value: billingBalance.paid },
            { label: "Outstanding", value: billingBalance.outstanding },
          ],
        }}
      />
    </AdminLayout>
  )
}
