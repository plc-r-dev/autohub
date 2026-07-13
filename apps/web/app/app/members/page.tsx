import { redirect } from "next/navigation"

export default function ServiceStoreMembersRedirectPage() {
  redirect("/app/settings?tab=staff")
}
