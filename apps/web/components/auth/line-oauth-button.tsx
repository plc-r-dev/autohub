"use client"

import { useState } from "react"
import { OAUTH_PORTAL_COOKIE } from "@/lib/auth/oauth-portal";
import {
  customerAuthClient,
  serviceStoreAuthClient,
} from "@/lib/auth-client";
import { cn } from "@workspace/ui/lib/utils";

type AuthPortal = "customer" | "serviceStore"

type LineOAuthButtonProps = {
  portal?: AuthPortal
  callbackUrl?: string
  errorCallbackURL?: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

const DEFAULTS: Record<
  AuthPortal,
  { callbackUrl: string; errorCallbackURL: string }
> = {
  customer: {
    callbackUrl: "/browse",
    errorCallbackURL: "/open-in-line?error=auth",
  },
  serviceStore: {
    callbackUrl: "/app",
    errorCallbackURL: "/?error=auth",
  },
}

function setOauthPortalCookie(portal: AuthPortal) {
  // Readable by the shared `/api/auth/callback/line` bridge (not HttpOnly).
  const maxAge = 60 * 10
  document.cookie = `${OAUTH_PORTAL_COOKIE}=${portal}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

export function LineOAuthButton({
  portal = "serviceStore",
  callbackUrl,
  errorCallbackURL,
  className,
  children,
  disabled,
}: LineOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const defaults = DEFAULTS[portal]
  const client = portal === "customer" ? customerAuthClient : serviceStoreAuthClient

  async function handleClick() {
    setIsLoading(true)
    setOauthPortalCookie(portal)

    const { error } = await client.signIn.oauth2({
      providerId: "line",
      callbackURL: callbackUrl ?? defaults.callbackUrl,
      errorCallbackURL: errorCallbackURL ?? defaults.errorCallbackURL,
    })

    if (error) {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={() => void handleClick()}
      className={cn(className, (disabled || isLoading) && "pointer-events-none opacity-70")}
    >
      {isLoading ? "Opening LINE…" : children}
    </button>
  )
}
