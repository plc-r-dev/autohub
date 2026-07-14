"use client"

import { useActionState } from "react"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import {
  updatePlatformSettings,
  type PlatformSettingsActionState,
} from "@/lib/platform-settings/actions"

type PlatformSettingsFormProps = {
  defaultValues: {
    bookingFee: string
    vatRate: string
    currency: string
    billingDueDays: number
    companyName: string
    taxId: string
    address: string
    bankName: string
    accountName: string
    accountNumber: string
    bankBranch: string
    storageProvider: string
    bucketName: string
    storageRegion: string
    timeZone: string
    dateFormat: string
    timeFormat: string
  }
}

const initialState: PlatformSettingsActionState = {}

export function PlatformSettingsForm({
  defaultValues,
}: PlatformSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettings,
    initialState,
  )

  return (
    <form action={formAction}>
      <Stack spacing={2.5}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        {state.success ? (
          <Alert severity="success">{state.success}</Alert>
        ) : null}

        <AdminSectionCard
          title="Billing"
          description="Fee and tax defaults snapshotted into new billings."
        >
          <Stack spacing={2}>
            <TextField
              id="bookingFee"
              name="bookingFee"
              label="Booking fee"
              type="number"
              required
              defaultValue={defaultValues.bookingFee}
              error={Boolean(state.fieldErrors?.bookingFee?.[0])}
              helperText={state.fieldErrors?.bookingFee?.[0]}
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              id="vatRate"
              name="vatRate"
              label="VAT rate (%)"
              type="number"
              required
              defaultValue={defaultValues.vatRate}
              error={Boolean(state.fieldErrors?.vatRate?.[0])}
              helperText={state.fieldErrors?.vatRate?.[0]}
              slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }}
            />
            <TextField
              id="currency"
              name="currency"
              label="Currency"
              required
              defaultValue={defaultValues.currency}
              error={Boolean(state.fieldErrors?.currency?.[0])}
              helperText={state.fieldErrors?.currency?.[0]}
            />
            <TextField
              id="billingDueDays"
              name="billingDueDays"
              label="Billing due days"
              type="number"
              required
              defaultValue={defaultValues.billingDueDays}
              error={Boolean(state.fieldErrors?.billingDueDays?.[0])}
              helperText={state.fieldErrors?.billingDueDays?.[0]}
              slotProps={{ htmlInput: { min: 1, max: 365 } }}
            />
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="Company">
          <Stack spacing={2}>
            <TextField
              id="companyName"
              name="companyName"
              label="Company name"
              defaultValue={defaultValues.companyName}
              error={Boolean(state.fieldErrors?.companyName?.[0])}
              helperText={state.fieldErrors?.companyName?.[0]}
            />
            <TextField
              id="taxId"
              name="taxId"
              label="Tax ID"
              defaultValue={defaultValues.taxId}
              error={Boolean(state.fieldErrors?.taxId?.[0])}
              helperText={state.fieldErrors?.taxId?.[0]}
            />
            <TextField
              id="address"
              name="address"
              label="Address"
              multiline
              minRows={3}
              defaultValue={defaultValues.address}
              error={Boolean(state.fieldErrors?.address?.[0])}
              helperText={state.fieldErrors?.address?.[0]}
            />
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="Bank account">
          <Stack spacing={2}>
            <TextField
              id="bankName"
              name="bankName"
              label="Bank name"
              defaultValue={defaultValues.bankName}
              error={Boolean(state.fieldErrors?.bankName?.[0])}
              helperText={state.fieldErrors?.bankName?.[0]}
            />
            <TextField
              id="accountName"
              name="accountName"
              label="Account name"
              defaultValue={defaultValues.accountName}
              error={Boolean(state.fieldErrors?.accountName?.[0])}
              helperText={state.fieldErrors?.accountName?.[0]}
            />
            <TextField
              id="accountNumber"
              name="accountNumber"
              label="Account number"
              defaultValue={defaultValues.accountNumber}
              error={Boolean(state.fieldErrors?.accountNumber?.[0])}
              helperText={state.fieldErrors?.accountNumber?.[0]}
            />
            <TextField
              id="bankBranch"
              name="bankBranch"
              label="Branch"
              defaultValue={defaultValues.bankBranch}
              error={Boolean(state.fieldErrors?.bankBranch?.[0])}
              helperText={state.fieldErrors?.bankBranch?.[0]}
            />
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="Storage">
          <Stack spacing={2}>
            <TextField
              id="storageProvider"
              name="storageProvider"
              label="Storage provider"
              select
              defaultValue={defaultValues.storageProvider}
              error={Boolean(state.fieldErrors?.storageProvider?.[0])}
              helperText={state.fieldErrors?.storageProvider?.[0]}
            >
              <MenuItem value="local">Local</MenuItem>
              <MenuItem value="s3">Amazon S3</MenuItem>
              <MenuItem value="r2">Cloudflare R2</MenuItem>
              <MenuItem value="azure">Azure Blob</MenuItem>
              <MenuItem value="gcs">Google Cloud Storage</MenuItem>
            </TextField>
            <TextField
              id="bucketName"
              name="bucketName"
              label="Bucket name"
              required
              defaultValue={defaultValues.bucketName}
              error={Boolean(state.fieldErrors?.bucketName?.[0])}
              helperText={state.fieldErrors?.bucketName?.[0]}
            />
            <TextField
              id="storageRegion"
              name="storageRegion"
              label="Region"
              defaultValue={defaultValues.storageRegion}
              error={Boolean(state.fieldErrors?.storageRegion?.[0])}
              helperText={state.fieldErrors?.storageRegion?.[0]}
            />
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="System">
          <Stack spacing={2}>
            <TextField
              id="timeZone"
              name="timeZone"
              label="Time zone"
              required
              defaultValue={defaultValues.timeZone}
              error={Boolean(state.fieldErrors?.timeZone?.[0])}
              helperText={state.fieldErrors?.timeZone?.[0]}
            />
            <TextField
              id="dateFormat"
              name="dateFormat"
              label="Date format"
              required
              defaultValue={defaultValues.dateFormat}
              error={Boolean(state.fieldErrors?.dateFormat?.[0])}
              helperText={state.fieldErrors?.dateFormat?.[0]}
            />
            <TextField
              id="timeFormat"
              name="timeFormat"
              label="Time format"
              required
              defaultValue={defaultValues.timeFormat}
              error={Boolean(state.fieldErrors?.timeFormat?.[0])}
              helperText={state.fieldErrors?.timeFormat?.[0]}
            />
          </Stack>
        </AdminSectionCard>

        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? "Saving..." : "Save platform settings"}
        </Button>
      </Stack>
    </form>
  )
}
