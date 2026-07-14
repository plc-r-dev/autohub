import { redirect } from "next/navigation";
import { PORTALS } from "@/lib/auth/portals";

/** Setup wizard retired — portal modules + settings replace it. */
export default function ServiceStoreSetupPage() {
  redirect(PORTALS.serviceStore.dashboard);
}
