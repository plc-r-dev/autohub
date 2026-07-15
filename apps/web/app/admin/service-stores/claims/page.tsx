import { AdminLayout } from "@/components/admin/admin-layout"
import { ServiceStoreRequestManagement } from "@/components/admin/service-store-request-management"
import { requireAdminSession } from "@/lib/auth/require-admin"

export default async function AdminStoreClaimsPage() {
  await requireAdminSession()

  return (
    <AdminLayout
      title="Store Claims"
      description="Review pending Service Store claims and onboarding requests. Approval links the domain user to the Service Store and tenant."
    >
      <ServiceStoreRequestManagement />
    </AdminLayout>
  )
}
