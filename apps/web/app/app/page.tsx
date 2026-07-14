import Link from "next/link"
import { redirect } from "next/navigation"
import { ServiceStoreOnboardingWizard } from "@/components/onboarding/service-store-onboarding-wizard"
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout"
import { ServiceStoreCard } from "@/components/service-store/ui"
import {
  StoreEmptyView,
  StoreSelectionView,
} from "@/components/service-store/store-selection/store-selection-view"
import { StoreMuiShell } from "@/components/service-store/theme/store-mui-shell"
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity"
import { PORTALS } from "@/lib/auth/portals"
import { getServerSession } from "@/lib/auth/session"
import { requireServiceStoreOnboardingContext } from "@/lib/onboarding/context"
import { listActiveTenants } from "@/lib/onboarding/queries"
import { prisma } from "@/lib/prisma"
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
} from "@/lib/service-store/access"
import {
  listPendingServiceStoreApplications,
  listServiceStoreWorkspaceSummaries,
} from "@/lib/service-store/application/member-queries"

type PageProps = {
  searchParams: Promise<{ mode?: string; error?: string; callbackUrl?: string }>
}

function splitDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" }
  }
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") }
}

export default async function ServiceStoreWorkspacePage({
  searchParams,
}: PageProps) {
  const params = await searchParams
  const isWizardMode =
    params.mode === "create" ||
    params.mode === "request" ||
    params.mode === "claim" ||
    params.mode === "onboard"

  const wizardDefaultMode: "claim" | "create" =
    params.mode === "create" || params.mode === "request" ? "create" : "claim"

  if (isWizardMode) {
    return <OnboardingWizardView defaultMode={wizardDefaultMode} />
  }

  const session = await getServerSession()
  if (!session) {
    const destination = new URL(PORTALS.marketing.home, "http://localhost")
    if (params.error) {
      destination.searchParams.set("error", params.error)
    }
    if (
      params.callbackUrl &&
      params.callbackUrl.startsWith("/app") &&
      params.callbackUrl !== "/"
    ) {
      destination.searchParams.set("callbackUrl", params.callbackUrl)
    }
    redirect(`${destination.pathname}${destination.search}`)
  }

  const displayName = session.user.name ?? ""
  const avatarUrl = session.user.image ?? null

  const identity = await resolveIdentityLink(session.user.id)
  if (!isIdentityLinked(identity) || !identity.domainUserId) {
    return (
      <StoreMuiShell>
        <StoreEmptyView displayName={displayName} avatarUrl={avatarUrl} />
      </StoreMuiShell>
    )
  }

  const access = await getServiceStoreAccessState(identity.domainUserId)
  const pendingApplications = await listPendingServiceStoreApplications(
    identity.domainUserId,
  )

  if (isPendingServiceStore(access)) {
    return (
      <StoreMuiShell>
        <StoreSelectionView
          displayName={displayName}
          avatarUrl={avatarUrl}
          summaries={[]}
          pendingApplications={pendingApplications}
          activeServiceStoreId={null}
        />
      </StoreMuiShell>
    )
  }

  if (isApprovedServiceStore(access)) {
    if (access.membershipCount === 1 && access.serviceStoreId) {
      await prisma.user.updateMany({
        where: {
          id: identity.domainUserId,
          OR: [
            { serviceStoreId: null },
            { NOT: { serviceStoreId: access.serviceStoreId } },
          ],
        },
        data: { serviceStoreId: access.serviceStoreId },
      })
    }

    const summaries = await listServiceStoreWorkspaceSummaries(
      identity.domainUserId,
    )
    return (
      <StoreMuiShell>
        <StoreSelectionView
          displayName={displayName}
          avatarUrl={avatarUrl}
          summaries={summaries}
          pendingApplications={pendingApplications}
          activeServiceStoreId={access.serviceStoreId}
        />
      </StoreMuiShell>
    )
  }

  return (
    <StoreMuiShell>
      <StoreEmptyView displayName={displayName} avatarUrl={avatarUrl} />
    </StoreMuiShell>
  )
}

async function OnboardingWizardView({
  defaultMode,
}: {
  defaultMode: "claim" | "create"
}) {
  const callbackPath = `/app?mode=onboard`
  const context = await requireServiceStoreOnboardingContext(callbackPath)
  const tenants = await listActiveTenants()
  const { firstName, lastName } = splitDisplayName(context.authUserName)

  return (
    <ServiceStorePublicLayout
      title="Add a Service Store"
      description="Choose how you want to join AutoHub — claim a shop already in our directory, or create a brand-new store."
      backHref="/app"
      backLabel="Back to workspaces"
      maxWidth="xl"
    >
      <ServiceStoreCard className="p-6 sm:p-8">
        <ServiceStoreOnboardingWizard
          tenants={tenants}
          defaultFirstName={firstName}
          defaultLastName={lastName}
          defaultEmail={context.authUserEmail}
          defaultMode={defaultMode}
        />
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  )
}
