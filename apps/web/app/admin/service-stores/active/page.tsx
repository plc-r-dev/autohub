import { Suspense } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminServiceStoresTable } from "@/components/admin/admin-service-stores-table"
import { requireAdminSession } from "@/lib/auth/require-admin"
import type { ServiceStoreStatus } from "@/lib/generated/prisma/client"
import { getAdminServiceStores } from "@/lib/service-store/admin-queries"

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export default async function AdminActiveServiceStoresPage({
  searchParams,
}: PageProps) {
  await requireAdminSession()
  const params = await searchParams

  const stores = await getAdminServiceStores({
    q: params.q,
    status: params.status as ServiceStoreStatus | "ALL" | undefined,
  })

  const rows = stores.map((store) => ({
    id: store.id,
    name: store.name,
    code: store.code,
    status: store.status,
    bookingEnabled: store.bookingEnabled,
    phone: store.phone,
    email: store.email,
    branchCount: store._count.branches,
    memberCount: store._count.members,
    updatedAt: store.updatedAt.toISOString(),
  }))

  return (
    <AdminLayout
      title="Active Stores"
      description="Search, filter, view, and suspend or activate service stores."
    >
      <Suspense fallback={null}>
        <AdminServiceStoresTable rows={rows} />
      </Suspense>
    </AdminLayout>
  )
}
