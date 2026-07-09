import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { formatBillingCurrency, formatBillingDate } from "@/lib/billing/format";
import { getReportData } from "@/lib/reporting/queries";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    merchantId?: string;
    branchId?: string;
    bookingStatus?: string;
  }>;
};

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildExportLink(
  reportType: string,
  format: "csv" | "excel",
  params: Record<string, string | undefined>,
): string {
  const query = new URLSearchParams();
  query.set("type", reportType);
  query.set("format", format);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  return `/admin/reports/export?${query.toString()}`;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireLinkedIdentity();
  const params = await searchParams;

  const filters = {
    from: parseDate(params.from),
    to: parseDate(params.to),
    merchantId: params.merchantId,
    branchId: params.branchId,
    bookingStatus: params.bookingStatus,
  };

  const [reportData, merchants, branches] = await Promise.all([
    getReportData(filters),
    prisma.merchant.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminLayout
      title="Reports"
      description="Export booking, billing, settlement, customer, and vehicle reports."
    >
      <form className="grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="date"
          name="from"
          defaultValue={params.from}
          className="border-input h-9 rounded-md border px-3 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to}
          className="border-input h-9 rounded-md border px-3 text-sm"
        />
        <select
          name="merchantId"
          defaultValue={params.merchantId}
          className="border-input h-9 rounded-md border px-3 text-sm"
        >
          <option value="">All merchants</option>
          {merchants.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>
              {merchant.name}
            </option>
          ))}
        </select>
        <select
          name="branchId"
          defaultValue={params.branchId}
          className="border-input h-9 rounded-md border px-3 text-sm"
        >
          <option value="">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <select
          name="bookingStatus"
          defaultValue={params.bookingStatus}
          className="border-input h-9 rounded-md border px-3 text-sm"
        >
          <option value="">All statuses</option>
          {[
            "PENDING",
            "CONFIRMED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
            "NO_SHOW",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border-input hover:bg-muted h-9 rounded-md border px-3 text-sm sm:col-span-2 lg:col-span-5"
        >
          Apply filters
        </button>
      </form>

      {(
        [
          ["booking", "Booking Report"],
          ["billing", "Billing Report"],
          ["settlement", "Settlement Report"],
          ["customer", "Customer Report"],
          ["vehicle", "Vehicle Report"],
        ] as const
      ).map(([type, title]) => {
        const rows = reportData[type];
        return (
          <section key={type} className="flex flex-col gap-3 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{title}</h2>
              <div className="flex gap-2 text-sm">
                <Link
                  href={buildExportLink(type, "csv", params)}
                  className="border-input hover:bg-muted rounded-md border px-3 py-1.5"
                >
                  Export CSV
                </Link>
                <Link
                  href={buildExportLink(type, "excel", params)}
                  className="border-input hover:bg-muted rounded-md border px-3 py-1.5"
                >
                  Export Excel
                </Link>
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm">No records.</p>
            ) : (
              <div className="overflow-auto">
                {(() => {
                  const firstRow = rows[0];
                  if (!firstRow) {
                    return null;
                  }
                  return (
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      {Object.keys(firstRow).map((key) => (
                        <th key={key} className="border-b px-2 py-2 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((row, idx) => (
                      <tr key={idx}>
                        {Object.entries(row).map(([key, value]) => (
                          <td key={key} className="border-b px-2 py-2">
                            {value instanceof Date
                              ? formatBillingDate(value)
                              : typeof value === "number" &&
                                  (key.toLowerCase().includes("amount") ||
                                    key.toLowerCase().includes("total"))
                                ? formatBillingCurrency(value)
                                : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                  );
                })()}
              </div>
            )}
          </section>
        );
      })}
    </AdminLayout>
  );
}
