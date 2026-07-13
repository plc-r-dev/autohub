import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { AvatarInitials } from "@/components/dashboard/avatar-initials";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";
import { formatDateTime } from "@/lib/booking/format";
import type { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

type Metrics = Awaited<ReturnType<typeof getServiceStoreDashboardMetrics>>;

type RecentCustomersProps = {
  customers: Metrics["recentCustomers"];
};

/** Customers with the most recent activity, most recent first -- scrolls once the list grows past a few rows. */
export function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <SectionHeader title="Recent customers" />
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <EmptyState icon={Users} message="No recent customers." />
        ) : (
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {customers.map((customer) => (
              <li key={customer.customerId}>
                <Link
                  href={`/app/customers/${customer.customerId}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2.5">
                    <AvatarInitials firstName={customer.firstName} lastName={customer.lastName} size="sm" />
                    <span className="font-medium text-foreground">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(customer.lastBookingDate)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
