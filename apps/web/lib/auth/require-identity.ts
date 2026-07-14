import type { IdentityLink } from "@/lib/auth/identity";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { PORTALS } from "@/lib/auth/portals";
import {
  getCustomerSession,
  getServiceStoreSession,
} from "@/lib/auth/session";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import type { CustomerSession, ServiceStoreSession } from "@/auth";
import { redirect } from "next/navigation";

export type AuthenticatedIdentity = {
  session: ServiceStoreSession;
  identity: IdentityLink;
};

export type AuthenticatedCustomerIdentity = {
  session: CustomerSession;
  identity: IdentityLink;
};

export async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
  const session = await getServiceStoreSession();
  if (!session) {
    return null;
  }

  const identity = await resolveIdentityLink(session.user.id);
  return { session, identity };
}

/** Session only — no domain user provisioning. Service Store / Admin cookie. */
export async function requireAuthSession(loginPath: string): Promise<ServiceStoreSession> {
  const session = await getServiceStoreSession();
  if (!session) {
    redirect(loginPath);
  }
  return session;
}

/**
 * ServiceStore portal session — independent from customer cookie/session.
 * Does NOT auto-create a Customer profile.
 */
export async function requireServiceStoreSession(): Promise<AuthenticatedIdentity> {
  const session = await getServiceStoreSession();
  if (!session) {
    redirect(PORTALS.marketing.home);
  }
  const identity = await resolveIdentityLink(session.user.id);
  return { session, identity };
}

/**
 * Customer portal session — auto-provisions Customer profile from LINE auth.
 * Uses the customer-scoped cookie, independent from Service Store login.
 */
export async function requireCustomerIdentity(): Promise<AuthenticatedCustomerIdentity> {
  const session = await getCustomerSession();
  if (!session) {
    redirect(PORTALS.customer.openInLine);
  }

  let identity = await resolveIdentityLink(session.user.id);
  if (!isIdentityLinked(identity)) {
    await ensureCustomerProfile({
      authUserId: session.user.id,
      displayName: session.user.name,
      imageUrl: session.user.image,
    });
    identity = await resolveIdentityLink(session.user.id);
  }

  if (!isIdentityLinked(identity)) {
    redirect(`${PORTALS.customer.openInLine}?error=auth`);
  }

  return { session, identity };
}

/** @deprecated Use `requireCustomerIdentity`. */
export async function requireLinkedIdentity(): Promise<AuthenticatedCustomerIdentity> {
  return requireCustomerIdentity();
}
