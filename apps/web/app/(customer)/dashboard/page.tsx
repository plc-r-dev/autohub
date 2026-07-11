import { redirect } from "next/navigation";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";

/** Legacy entry — customer marketplace home. */
export default async function DashboardPage() {
  await requireLinkedIdentity();
  redirect("/browse");
}
