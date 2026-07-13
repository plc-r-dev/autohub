import { redirect } from "next/navigation"

export default function BranchHoursRedirectPage() {
  redirect("/app/settings?tab=hours")
}
