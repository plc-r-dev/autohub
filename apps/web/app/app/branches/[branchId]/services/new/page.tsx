import { redirect } from "next/navigation"

export default function NewBranchServiceRedirectPage() {
  redirect("/app/settings?tab=services")
}
