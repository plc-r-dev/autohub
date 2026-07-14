import { redirect } from "next/navigation"
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity"
import { getServerSession } from "@/lib/auth/session"
import {
  getServiceStoreAccessState,
  isPendingServiceStore,
} from "@/lib/service-store/access"
import { prisma } from "@/lib/prisma"

export type OnboardingContext = {
  authUserId: string
  authUserName: string
  authUserEmail: string
  lineUserId: string | null
}

export async function getLineUserId(authUserId: string): Promise<string | null> {
  const account = await prisma.authAccount.findFirst({
    where: {
      userId: authUserId,
      providerId: "line",
    },
    select: {
      accountId: true,
    },
  })

  return account?.accountId ?? null
}

export async function requireOnboardingContext(): Promise<OnboardingContext> {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }

  const identity = await resolveIdentityLink(session.user.id)
  if (isIdentityLinked(identity)) {
    redirect("/browse")
  }

  const lineUserId = await getLineUserId(session.user.id)

  return {
    authUserId: session.user.id,
    authUserName: session.user.name,
    authUserEmail: session.user.email,
    lineUserId,
  }
}

/** ServiceStore portal onboarding — claim/create wizard entry. */
export async function requireServiceStoreOnboardingContext(
  callbackPath: string = "/app",
): Promise<OnboardingContext> {
  const session = await getServerSession()
  if (!session) {
    redirect(`/?callbackUrl=${encodeURIComponent(callbackPath)}`)
  }

  const identity = await resolveIdentityLink(session.user.id)
  if (isIdentityLinked(identity) && identity.domainUserId) {
    const serviceStoreAccess = await getServiceStoreAccessState(
      identity.domainUserId,
    )
    // Pending approval: send back to workspace. Approved users may still
    // claim/create another store — never bounce them to the dashboard here.
    if (isPendingServiceStore(serviceStoreAccess)) {
      redirect("/app")
    }
  }

  const lineUserId = await getLineUserId(session.user.id)

  return {
    authUserId: session.user.id,
    authUserName: session.user.name,
    authUserEmail: session.user.email,
    lineUserId,
  }
}
