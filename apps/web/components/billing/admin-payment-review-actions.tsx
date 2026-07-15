"use client"

import { useActionState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import {
  approveBillingPaymentAsAdmin,
  type BillingActionState,
  rejectBillingPaymentAsAdmin,
} from "@/lib/billing/actions"

const initialState: BillingActionState = {}

type AdminPaymentReviewActionsProps = {
  billingId: string
  paymentId: string
  reviewStatus: string
  billingStatus: string
}

export function AdminPaymentReviewActions({
  billingId,
  paymentId,
  reviewStatus,
  billingStatus,
}: AdminPaymentReviewActionsProps) {
  const router = useRouter()
  const [isApproving, startTransition] = useTransition()
  const [state, rejectAction, isRejecting] = useActionState(
    rejectBillingPaymentAsAdmin.bind(null, billingId, paymentId),
    initialState,
  )

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [state.success, router])

  if (reviewStatus !== "PENDING" || billingStatus !== "PAYMENT_SUBMITTED") {
    return null
  }

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      {state.success ? (
        <Alert severity="success">{state.success}</Alert>
      ) : null}

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Button
          type="button"
          size="small"
          variant="contained"
          disabled={isApproving || isRejecting}
          onClick={() =>
            startTransition(async () => {
              await approveBillingPaymentAsAdmin(billingId, paymentId)
              router.refresh()
            })
          }
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      </Stack>

      <form action={rejectAction}>
        <Stack spacing={1.5}>
          <TextField
            id="reason"
            name="reason"
            label="Reject reason"
            required
            size="small"
            multiline
            minRows={2}
            error={Boolean(state.fieldErrors?.reason?.[0])}
            helperText={state.fieldErrors?.reason?.[0]}
          />
          <Button
            type="submit"
            size="small"
            variant="outlined"
            color="error"
            disabled={isRejecting || isApproving}
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
