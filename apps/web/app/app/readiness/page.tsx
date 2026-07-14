import { redirect } from "next/navigation";
import { PORTALS } from "@/lib/auth/portals";

/** Readiness checklist UI removed. */
export default function ServiceStoreReadinessPage() {
  redirect(PORTALS.serviceStore.dashboard);
}
