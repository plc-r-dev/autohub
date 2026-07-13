import { redirect } from "next/navigation"

export default function BranchServicesRedirectPage() {
  redirect("/app/settings?tab=services")
}
