import type { Session } from "@/auth";
import { PORTALS } from "@/lib/auth/portals";
import { requireAuthSession } from "@/lib/auth/require-identity";

/** Admin portal session — independent from customer provisioning. */
export async function requireAdminSession(): Promise<Session> {
  return requireAuthSession(PORTALS.admin.login);
}
