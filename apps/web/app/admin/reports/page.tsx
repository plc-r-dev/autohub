import { Suspense } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  AdminReportsWorkspace,
  type ReportTab,
} from "@/components/reporting/admin-reports-workspace"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getReportData } from "@/lib/reporting/queries"
import { prisma } from "@/lib/prisma"

type PageProps = {
  searchParams: Promise<{
    tab?: string
    from?: string
    to?: string
    serviceStoreId?: string
    branchId?: string
    bookingStatus?: string
  }>
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function parseTab(value?: string): ReportTab {
  if (
    value === "booking" ||
    value === "billing" ||
    value === "settlement" ||
    value === "customer" ||
    value === "vehicle"
  ) {
    return value
  }
  return "booking"
}

function serializeRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    const next: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      next[key] =
        value instanceof Date
          ? value.toISOString()
          : typeof value === "bigint"
            ? Number(value)
            : value
    }
    return next
  })
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireAdminSession()
  const params = await searchParams
  const tab = parseTab(params.tab)

  const filters = {
    from: parseDate(params.from),
    to: parseDate(params.to),
    serviceStoreId: params.serviceStoreId,
    branchId: params.branchId,
    bookingStatus: params.bookingStatus,
  }

  const [reportData, serviceStores, branches] = await Promise.all([
    getReportData(filters),
    prisma.serviceStore.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      select: { id: true, name: true, serviceStoreId: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <AdminLayout
      title="Reports"
      description="Analyze booking, billing, settlement, customer, and vehicle data."
    >
      <Suspense fallback={null}>
        <AdminReportsWorkspace
          initialTab={tab}
          filters={{
            from: params.from,
            to: params.to,
            serviceStoreId: params.serviceStoreId,
            branchId: params.branchId,
            bookingStatus: params.bookingStatus,
          }}
          serviceStores={serviceStores}
          branches={branches}
          reportData={{
            booking: serializeRows(
              reportData.booking as unknown as Array<Record<string, unknown>>,
            ),
            billing: serializeRows(
              reportData.billing as unknown as Array<Record<string, unknown>>,
            ),
            settlement: serializeRows(
              reportData.settlement as unknown as Array<
                Record<string, unknown>
              >,
            ),
            customer: serializeRows(
              reportData.customer as unknown as Array<Record<string, unknown>>,
            ),
            vehicle: serializeRows(
              reportData.vehicle as unknown as Array<Record<string, unknown>>,
            ),
          }}
        />
      </Suspense>
    </AdminLayout>
  )
}
