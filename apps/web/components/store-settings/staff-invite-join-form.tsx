"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ServiceStoreButton } from "@/components/service-store/ui"
import { acceptStaffInvite } from "@/lib/service-store/staff-invite-actions"

type StaffInviteJoinFormProps = {
  token: string
}

export function StaffInviteJoinForm({ token }: StaffInviteJoinFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const result = await acceptStaffInvite(token)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push("/app/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <ServiceStoreButton
        type="button"
        disabled={isPending}
        onClick={handleJoin}
        className="w-full sm:w-auto"
      >
        {isPending ? "Joining…" : "Join store"}
      </ServiceStoreButton>
    </div>
  )
}
