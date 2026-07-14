"use client"

import { useTransition } from "react"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import {
  approveServiceStoreClaim,
  approveServiceStoreOnboardingRequest,
  rejectServiceStoreClaim,
  rejectServiceStoreOnboardingRequest,
} from "@/lib/service-store/actions"

type ServiceStoreRequestActionsProps = {
  type: "claim" | "onboarding-request"
  requestId: string
}

export function ServiceStoreRequestActions({
  type,
  requestId,
}: ServiceStoreRequestActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      if (type === "claim") {
        await approveServiceStoreClaim(requestId)
      } else {
        await approveServiceStoreOnboardingRequest(requestId)
      }
    })
  }

  function handleReject() {
    startTransition(async () => {
      if (type === "claim") {
        await rejectServiceStoreClaim(requestId)
      } else {
        await rejectServiceStoreOnboardingRequest(requestId)
      }
    })
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
      <Button
        type="button"
        size="small"
        variant="contained"
        disabled={isPending}
        onClick={handleApprove}
      >
        Approve
      </Button>
      <Button
        type="button"
        size="small"
        variant="outlined"
        color="error"
        disabled={isPending}
        onClick={handleReject}
      >
        Reject
      </Button>
    </Stack>
  )
}
