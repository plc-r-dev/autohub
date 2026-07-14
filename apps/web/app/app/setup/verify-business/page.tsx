import { redirect } from "next/navigation"

/** Verify-business step removed — continue with services setup. */
export default function ServiceStoreSetupVerifyPage() {
  redirect("/app/setup/services")
}
