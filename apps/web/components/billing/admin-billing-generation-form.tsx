"use client"

import { useActionState } from "react"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import {
  generateMonthlyBilling,
  type BillingActionState,
} from "@/lib/billing/actions"

const initialState: BillingActionState = {}

type AdminBillingGenerationFormProps = {
  defaultPeriodStart: string
  defaultPeriodEnd: string
  bookingFee: string
  vatRate: string
  currency: string
}

export function AdminBillingGenerationForm({
  defaultPeriodStart,
  defaultPeriodEnd,
  bookingFee,
  vatRate,
  currency,
}: AdminBillingGenerationFormProps) {
  const [state, formAction, isPending] = useActionState(
    generateMonthlyBilling,
    initialState,
  )

  return (
    <AdminSectionCard
      title="Generate monthly billing"
      description={`Uses current platform settings: ${bookingFee} ${currency} per completed booking, ${vatRate}% VAT. Values are snapshotted into each billing.`}
    >
      <form action={formAction}>
        <Stack spacing={2}>
          {state.error ? <Alert severity="error">{state.error}</Alert> : null}
          {state.success ? (
            <Alert severity="success">{state.success}</Alert>
          ) : null}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            useFlexGap
          >
            <TextField
              id="periodStart"
              name="periodStart"
              label="Period start"
              type="date"
              required
              defaultValue={defaultPeriodStart}
              error={Boolean(state.fieldErrors?.periodStart?.[0])}
              helperText={state.fieldErrors?.periodStart?.[0]}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              id="periodEnd"
              name="periodEnd"
              label="Period end"
              type="date"
              required
              defaultValue={defaultPeriodEnd}
              error={Boolean(state.fieldErrors?.periodEnd?.[0])}
              helperText={state.fieldErrors?.periodEnd?.[0]}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Idempotent for the same service store and period.
          </Typography>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Generating..." : "Generate billings"}
          </Button>
        </Stack>
      </form>
    </AdminSectionCard>
  )
}
