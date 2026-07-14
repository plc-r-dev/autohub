import { redirect } from "next/navigation";
import { PORTALS } from "@/lib/auth/portals";

/** Legacy /dashboard entry — always land on the marketing home. */
export default function DashboardPage() {
  redirect(PORTALS.marketing.home);
}
