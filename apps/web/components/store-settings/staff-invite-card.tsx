"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import { Copy, QrCode, RefreshCw } from "lucide-react"
import { DetailModalShell } from "@/components/service-store/modals/detail-modal-shell"
import { ServiceStoreButton, ServiceStoreCard } from "@/components/service-store/ui"
import {
  getOrCreateStaffInviteLink,
  regenerateStaffInviteLinkAction,
} from "@/lib/service-store/staff-invite-actions"
import { cn } from "@workspace/ui/lib/utils"

type StaffInviteCardProps = {
  initialInviteUrl?: string | null
  initialExpiresAt?: string | null
  canManage: boolean
}

function formatExpiry(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function StaffInviteCard({
  initialInviteUrl,
  initialExpiresAt,
  canManage,
}: StaffInviteCardProps) {
  const [inviteUrl, setInviteUrl] = useState(initialInviteUrl ?? "")
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ?? "")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!canManage || inviteUrl) {
      return
    }

    startTransition(async () => {
      const result = await getOrCreateStaffInviteLink()
      if (result.ok) {
        setInviteUrl(result.inviteUrl)
        setExpiresAt(result.expiresAt)
      }
    })
  }, [canManage, inviteUrl])

  useEffect(() => {
    if (!qrOpen || !inviteUrl) {
      return
    }

    let cancelled = false

    void import("qrcode").then((QRCode) =>
      QRCode.toDataURL(inviteUrl, {
        width: 240,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      }),
    )

    return () => {
      cancelled = true
    }
  }, [qrOpen, inviteUrl])

  function handleCopy() {
    if (!inviteUrl) {
      return
    }

    void navigator.clipboard.writeText(inviteUrl).then(() => {
      setMessage("Invitation link copied.")
      setError(null)
    })
  }

  function handleRegenerate() {
    if (!confirm("Regenerate the invitation link? Existing links will stop working.")) {
      return
    }

    startTransition(async () => {
      const result = await regenerateStaffInviteLinkAction()
      if (!result.ok) {
        setError(result.error)
        setMessage(null)
        return
      }

      setInviteUrl(result.inviteUrl)
      setExpiresAt(result.expiresAt)
      setMessage(result.message ?? "Invitation link regenerated.")
      setError(null)
      setQrDataUrl(null)
    })
  }

  if (!canManage) {
    return null
  }

  return (
    <>
      <ServiceStoreCard className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Invite staff</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a reusable invitation link for this store. Share it via LINE, SMS,
            email, or any messaging app.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            {message}
          </p>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Invitation link</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={inviteUrl}
              placeholder={isPending ? "Generating link…" : "Invitation link"}
              className={cn(
                "h-10 min-w-0 flex-1 rounded-xl border border-border bg-muted/30 px-3 text-sm text-foreground dark:bg-muted/20",
              )}
            />
            <div className="flex flex-wrap gap-2">
              <ServiceStoreButton
                type="button"
                variant="secondary"
                disabled={!inviteUrl || isPending}
                onClick={handleCopy}
                className="gap-1.5"
              >
                <Copy className="size-4" />
                Copy link
              </ServiceStoreButton>
              <ServiceStoreButton
                type="button"
                variant="secondary"
                disabled={!inviteUrl || isPending}
                onClick={() => setQrOpen(true)}
                className="gap-1.5"
              >
                <QrCode className="size-4" />
                QR code
              </ServiceStoreButton>
              <ServiceStoreButton
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={handleRegenerate}
                className="gap-1.5"
              >
                <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
                Regenerate
              </ServiceStoreButton>
            </div>
          </div>
          {expiresAt ? (
            <p className="text-xs text-muted-foreground">
              Expires {formatExpiry(expiresAt)}
            </p>
          ) : null}
        </div>
      </ServiceStoreCard>

      <DetailModalShell
        open={qrOpen}
        onOpenChange={setQrOpen}
        className="max-w-sm"
        header={<p className="text-lg font-semibold text-foreground">Invitation QR code</p>}
      >
        <div className="flex flex-col items-center gap-3 py-2">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="Staff invitation QR code"
              width={240}
              height={240}
              unoptimized
              className="rounded-xl border border-border"
            />
          ) : (
            <div className="flex size-[240px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
              Generating…
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Scan to open the staff invitation link.
          </p>
        </div>
      </DetailModalShell>
    </>
  )
}
