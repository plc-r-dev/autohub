import Link from "next/link"
import { StaffInviteJoinForm } from "@/components/store-settings/staff-invite-join-form"
import { PortalLoginScreen } from "@/components/auth/portal-login-screen"
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout"
import { getServerSession } from "@/lib/auth/session"
import {
  getStaffInviteByToken,
  validateStaffInviteToken,
} from "@/lib/service-store/application/staff-invite-queries"

type PageProps = {
  params: Promise<{ token: string }>
}

function inviteErrorMessage(reason: "NOT_FOUND" | "REVOKED" | "EXPIRED") {
  switch (reason) {
    case "REVOKED":
      return "This invitation link has been revoked. Ask the store owner for a new link."
    case "EXPIRED":
      return "This invitation link has expired. Ask the store owner for a new link."
    default:
      return "This invitation link is invalid."
  }
}

export default async function StaffInvitePage({ params }: PageProps) {
  const { token } = await params
  const inviteRecord = await getStaffInviteByToken(token)
  const validation = validateStaffInviteToken(inviteRecord)
  const session = await getServerSession()
  const callbackUrl = `/invite/${token}`

  if (!validation.ok) {
    return (
      <ServiceStorePublicLayout
        title="Invitation unavailable"
        description={inviteErrorMessage(validation.reason)}
        backHref="/app"
        maxWidth="md"
      >
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Contact the store owner if you still need access.
          </p>
        </div>
      </ServiceStorePublicLayout>
    )
  }

  if (!session) {
    return (
      <ServiceStorePublicLayout
        title={`Join ${validation.invite.serviceStoreName}`}
        description="Sign in with LINE to accept this staff invitation."
        backHref="/app"
        maxWidth="md"
      >
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <PortalLoginScreen
            embedded
            portal="serviceStore"
            title="Continue with LINE"
            description="Use the same LINE account you want to use for this store."
            defaultCallbackUrl={callbackUrl}
            errorCallbackURL={`/?error=auth&callbackUrl=${encodeURIComponent(callbackUrl)}`}
          />
        </div>
      </ServiceStorePublicLayout>
    )
  }

  return (
    <ServiceStorePublicLayout
      title={`Join ${validation.invite.serviceStoreName}`}
      description="You are signed in. Accept the invitation to become staff for this store."
      backHref="/app"
      maxWidth="md"
    >
      <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Store</p>
          <p className="text-lg font-semibold text-foreground">
            {validation.invite.serviceStoreName}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          After joining, you will be added as staff and redirected to the store dashboard.
        </p>

        <StaffInviteJoinForm token={token} />

        <p className="text-xs text-muted-foreground">
          Not you?{" "}
          <Link
            href={`/?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-foreground underline"
          >
            Switch LINE account
          </Link>
        </p>
      </div>
    </ServiceStorePublicLayout>
  )
}
