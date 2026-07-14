"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { PORTALS } from "@/lib/auth/portals"
import { cn } from "@workspace/ui/lib/utils"

export type ServicePortalSessionAccount = {
  name: string
  image: string | null
}

type ServicePortalLoginProps = {
  account: ServicePortalSessionAccount
  defaultCallbackUrl?: string
  errorCallbackURL?: string
}

function BrandMark() {
  return (
    <div className="flex justify-center bg-transparent">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark.png"
        alt="AutoHub"
        width={909}
        height={156}
        className="h-9 w-auto bg-transparent dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/autohub-wordmark-dark.png"
        alt=""
        width={860}
        height={149}
        aria-hidden
        className="hidden h-9 w-auto bg-transparent dark:block"
      />
    </div>
  )
}

function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.281-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 0 1-.63-.63V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.141a.63.63 0 0 1-.63.63zm-1.647 0a.618.618 0 0 1-.587-.403l-.66-1.853c-.01-.025-.022-.051-.034-.076l-.033.076-.66 1.853a.615.615 0 0 1-.586.403.634.634 0 0 1-.595-.826l1.163-3.14c.096-.28.37-.47.68-.47.31 0 .584.19.68.47l1.163 3.14a.634.634 0 0 1-.595.826zm-4.561 0c-.345 0-.626-.285-.626-.63V8.108c0-.345.281-.63.626-.63.345 0 .626.285.626.63v4.141c0 .345-.281.63-.626.63zm-2.79.015H3.178a.62.62 0 0 1-.619-.62c0-.345.274-.629.619-.629h1.076V8.108c0-.345.281-.63.63-.63.348 0 .63.285.63.63v4.246c0 .345-.282.63-.63.63zM12 2C6.478 2 2 5.977 2 10.886c0 4.418 3.918 8.119 9.22 8.826.36.077.849.238 1.043.546.175.28.114.72.056 1.005l-.244 1.45c-.072.426-.309 1.666 1.455.91 1.764-.756 9.51-5.607 9.51-12.737C23 5.977 18.522 2 13 2h-1z" />
    </svg>
  )
}

function AccountAvatar({
  name,
  image,
}: {
  name: string
  image: string | null
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={96}
        height={96}
        className="size-24 rounded-full object-cover shadow-sm ring-4 ring-card"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className="flex size-24 items-center justify-center rounded-full bg-primary/15 text-3xl font-semibold text-primary shadow-sm ring-4 ring-card dark:text-foreground">
      {initial}
    </div>
  )
}

function resolveCallbackUrl(
  rawCallbackUrl: string | null,
  defaultCallbackUrl: string,
) {
  if (!rawCallbackUrl || rawCallbackUrl === "/" || !rawCallbackUrl.startsWith("/app")) {
    return defaultCallbackUrl
  }
  return rawCallbackUrl
}

function ServicePortalLoginForm({
  account: serverAccount,
  defaultCallbackUrl = PORTALS.serviceStore.home,
}: ServicePortalLoginProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: liveSession } = useSession()
  const callbackUrl = resolveCallbackUrl(
    searchParams.get("callbackUrl"),
    defaultCallbackUrl,
  )

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const account = useMemo(() => {
    if (liveSession?.user) {
      return {
        name: liveSession.user.name?.trim() || "LINE User",
        image: liveSession.user.image ?? null,
      }
    }
    return serverAccount
  }, [liveSession, serverAccount])

  function handleContinue() {
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleUseAnotherAccount() {
    setError(null)
    setIsLoading(true)

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace(PORTALS.serviceStore.home)
          router.refresh()
        },
        onError: () => {
          setIsLoading(false)
          setError("Unable to switch accounts. Please try again.")
        },
      },
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[400px] rounded-3xl border border-border bg-card px-7 py-10 shadow-sm sm:px-9">
        <div className="flex flex-col items-center gap-7 text-center">
          <BrandMark />

          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-muted-foreground">
              Service Portal
            </p>
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-foreground">
              Continue with this account?
            </h1>
          </div>

          <div className="flex w-full flex-col items-center gap-3 pt-1">
            <AccountAvatar name={account.name} image={account.image} />
            <div className="space-y-1">
              <p className="text-[20px] font-semibold tracking-tight text-foreground">
                {account.name}
              </p>
              <p className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <LineMark className="size-3.5 text-[#06C755]" />
                Signed in with LINE
              </p>
            </div>
          </div>

          <div className="w-full space-y-3 pt-1">
            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={isLoading}
              onClick={handleContinue}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:opacity-95",
                "dark:border dark:border-border dark:bg-muted dark:text-foreground dark:hover:bg-accent",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              Continue as {account.name}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleUseAnotherAccount()}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-colors",
                "hover:bg-muted disabled:opacity-60",
              )}
            >
              {isLoading ? "Signing out…" : "Use another account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ServicePortalLogin(props: ServicePortalLoginProps) {
  return (
    <Suspense fallback={null}>
      <ServicePortalLoginForm {...props} />
    </Suspense>
  )
}
