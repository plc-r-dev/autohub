import { connection } from "next/server"
import { redirect } from "next/navigation"
import { ServicePortalLogin } from "@/components/auth/service-portal-login"
import { getServerSession } from "@/lib/auth/session"
import { PORTALS } from "@/lib/auth/portals"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}

export default async function ServiceStoreLoginPage({ searchParams }: PageProps) {
  await connection()
  const params = await searchParams
  const session = await getServerSession()

  // No session → marketing landing (not /app).
  if (!session?.user) {
    const destination = new URL(PORTALS.marketing.home, "http://localhost")
    if (params.error) {
      destination.searchParams.set("error", params.error)
    }
    redirect(`${destination.pathname}${destination.search}`)
  }

  const callbackUrl =
    params.callbackUrl &&
    params.callbackUrl.startsWith("/app") &&
    params.callbackUrl !== "/"
      ? params.callbackUrl
      : PORTALS.serviceStore.home

  return (
    <ServicePortalLogin
      account={{
        name: session.user.name?.trim() || "LINE User",
        image: session.user.image ?? null,
      }}
      defaultCallbackUrl={callbackUrl}
      errorCallbackURL="/?error=auth"
    />
  )
}
