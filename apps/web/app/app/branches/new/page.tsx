import { redirect } from "next/navigation"

export default function NewBranchRedirectPage() {
  redirect("/app/settings")
}
