import { redirect } from "next/navigation";
import type { IdentityLink } from "@/lib/auth/identity";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { PORTALS } from "@/lib/auth/portals";
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

/** Session only — no domain user provisioning. */
export async function requireAuthSession(loginPath: string): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect(loginPath);
  }
  return session;
}

/**
 * ServiceStore portal session — independent from customer provisioning.
 * Does NOT auto-create a Customer profile.
 */
export async function requireServiceStoreSession(): Promise<AuthenticatedIdentity> {
  const session = await requireAuthSession(PORTALS.serviceStore.login);
  const identity = await resolveIdentityLink(session.user.id);
  return { session, identity };
}

/**
 * Customer LIFF session — auto-provisions Customer profile from LINE auth.
 * Primary customer entry is LINE OA → LIFF, not the web login page.
 */
export async function requireCustomerIdentity(): Promise<AuthenticatedIdentity> {
  const session = await requireAuthSession(PORTALS.customer.openInLine);

  let identity = await resolveIdentityLink(session.user.id);

  if (!isIdentityLinked(identity)) {
    try {
      await ensureCustomerProfile({
        authUserId: session.user.id,
        displayName: session.user.name,
        imageUrl: session.user.image,
      });
    } catch {
      redirect(`${PORTALS.customer.openInLine}?error=auth`);
    }

    identity = await resolveIdentityLink(session.user.id);
    if (!isIdentityLinked(identity)) {
      redirect(`${PORTALS.customer.openInLine}?error=auth`);
    }
  }

  return { session, identity };
}

/** @deprecated Use requireCustomerIdentity or requireServiceStoreSession explicitly. */
export async function requireLinkedIdentity(): Promise<AuthenticatedIdentity> {
  return requireCustomerIdentity();
}
