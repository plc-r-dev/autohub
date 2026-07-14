"use client"

import { useActionState, useTransition } from "react"
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
  const [isApproving, startTransition] = useTransition()
  const [state, rejectAction, isRejecting] = useActionState(
    rejectBillingPaymentAsAdmin.bind(null, billingId, paymentId),
    initialState,
  )

  if (reviewStatus !== "PENDING" || billingStatus !== "PAYMENT_SUBMITTED") {
    return null
  }

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      {state.success ? (
        <Alert severity="success">{state.success}</Alert>
      ) : null}

      <Button
        type="button"
        size="small"
        variant="contained"
        disabled={isApproving}
        onClick={() =>
          startTransition(async () => {
            await approveBillingPaymentAsAdmin(billingId, paymentId)
          })
        }
      >
        {isApproving ? "Approving..." : "Approve payment"}
      </Button>

      <form action={rejectAction}>
        <Stack spacing={1.5}>
          <TextField
            id="reason"
            name="reason"
            label="Reject reason"
            required
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
            disabled={isRejecting}
          >
            {isRejecting ? "Rejecting..." : "Reject payment"}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
