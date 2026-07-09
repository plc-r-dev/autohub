import { redirect } from "next/navigation";
import type { IdentityLink } from "@/lib/auth/identity";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { getServerSession } from "@/lib/auth/session";
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

  const identity = await resolveIdentityLink(session.user.id);

  if (!isIdentityLinked(identity)) {
    redirect("/onboarding");
  }

  return { session, identity };
}
