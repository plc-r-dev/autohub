import { redirect } from "next/navigation";
import type { IdentityLink } from "@/lib/auth/identity";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import type { Session } from "@/auth";

export type AuthenticatedIdentity = {
  session: Session;
  identity: IdentityLink;
};

export async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const identity = await resolveIdentityLink(session.user.id);
  return { session, identity };
}

export async function requireLinkedIdentity(): Promise<AuthenticatedIdentity> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  let identity = await resolveIdentityLink(session.user.id);

  if (!isIdentityLinked(identity)) {
    try {
      await ensureCustomerProfile({
        authUserId: session.user.id,
        displayName: session.user.name,
        imageUrl: session.user.image,
      });
    } catch {
      redirect("/login?error=auth");
    }

    identity = await resolveIdentityLink(session.user.id);
    if (!isIdentityLinked(identity)) {
      redirect("/login?error=auth");
    }
  }

  return { session, identity };
}
