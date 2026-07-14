import { redirect } from "next/navigation"
import { AdminLandingView } from "@/components/admin/admin-landing-view"
import { PORTALS } from "@/lib/auth/portals"
import { getServiceStoreSession } from "@/lib/auth/session"

export default async function AdminLandingPage() {
  const session = await getServiceStoreSession()
  if (session) {
    redirect(PORTALS.admin.dashboard)
  }

  return <AdminLandingView />
}
