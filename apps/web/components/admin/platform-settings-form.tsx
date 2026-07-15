"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import {
  updatePlatformSettingsSection,
  type PlatformSettingsActionState,
  type PlatformSettingsSection,
} from "@/lib/platform-settings/actions"

export type PlatformSettingsValues = {
  bookingFee: string
  vatRate: string
  currency: string
  billingDueDays: number
  companyName: string
  taxId: string
  address: string
  companyLogoKey: string | null
  bankName: string
  accountName: string
  accountNumber: string
  bankBranch: string
  promptPayQrKey: string | null
  storageProvider: string
  bucketName: string
  storageRegion: string
  timeZone: string
  language: string
  dateFormat: string
  timeFormat: string
  updatedAt: string
}

type PlatformSettingsFormProps = {
  defaultValues: PlatformSettingsValues
  companyLogoUrl: string | null
  promptPayQrUrl: string | null
  initialTab?: PlatformSettingsSection
}

const initialState: PlatformSettingsActionState = {}

const TABS: Array<{ value: PlatformSettingsSection; label: string }> = [
  { value: "billing", label: "Billing" },
  { value: "company", label: "Company" },
  { value: "payment", label: "Payment" },
  { value: "storage", label: "Storage" },
  { value: "system", label: "System" },
]

function SectionActions({
  isPending,
  onReset,
}: {
  isPending: boolean
  onReset: () => void
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ justifyContent: "flex-end", pt: 1 }}
    >
      <Button
        type="button"
        size="small"
        variant="outlined"
        onClick={onReset}
        disabled={isPending}
      >
        Reset
      </Button>
      <Button type="submit" size="small" variant="contained" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </Stack>
  )
}

function StatusAlerts({ state }: { state: PlatformSettingsActionState }) {
  return (
    <>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      {state.success ? <Alert severity="success">{state.success}</Alert> : null}
    </>
  )
}

function BillingTab({
  defaultValues,
  formKey,
  onReset,
}: {
  defaultValues: PlatformSettingsValues
  formKey: string
  onReset: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettingsSection.bind(null, "billing"),
    initialState,
  )

  return (
    <form key={formKey} action={formAction}>
      <Stack spacing={2}>
        <StatusAlerts state={state} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <TextField
            size="small"
            name="bookingFee"
            label="Booking Fee"
            type="number"
            required
            defaultValue={defaultValues.bookingFee}
            error={Boolean(state.fieldErrors?.bookingFee?.[0])}
            helperText={state.fieldErrors?.bookingFee?.[0]}
            sx={{ minWidth: 160, flex: 1 }}
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          />
          <TextField
            size="small"
            name="vatRate"
            label="VAT"
            type="number"
            required
            defaultValue={defaultValues.vatRate}
            error={Boolean(state.fieldErrors?.vatRate?.[0])}
            helperText={state.fieldErrors?.vatRate?.[0]}
            sx={{ minWidth: 140, flex: 1 }}
            slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }}
          />
          <TextField
            size="small"
            name="currency"
            label="Currency"
            required
            defaultValue={defaultValues.currency}
            error={Boolean(state.fieldErrors?.currency?.[0])}
            helperText={state.fieldErrors?.currency?.[0]}
            sx={{ minWidth: 120, flex: 1 }}
          />
          <TextField
            size="small"
            name="billingDueDays"
            label="Billing Due Days"
            type="number"
            required
            defaultValue={defaultValues.billingDueDays}
            error={Boolean(state.fieldErrors?.billingDueDays?.[0])}
            helperText={state.fieldErrors?.billingDueDays?.[0]}
            sx={{ minWidth: 160, flex: 1 }}
            slotProps={{ htmlInput: { min: 1, max: 365 } }}
          />
        </Stack>
        <SectionActions isPending={isPending} onReset={onReset} />
      </Stack>
    </form>
  )
}

function CompanyTab({
  defaultValues,
  companyLogoUrl,
  formKey,
  onReset,
}: {
  defaultValues: PlatformSettingsValues
  companyLogoUrl: string | null
  formKey: string
  onReset: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettingsSection.bind(null, "company"),
    initialState,
  )

  return (
    <form key={formKey} action={formAction}>
      <Stack spacing={2}>
        <StatusAlerts state={state} />
        <TextField
          size="small"
          name="companyName"
          label="Company Name"
          defaultValue={defaultValues.companyName}
          error={Boolean(state.fieldErrors?.companyName?.[0])}
          helperText={state.fieldErrors?.companyName?.[0]}
          fullWidth
        />
        <TextField
          size="small"
          name="taxId"
          label="Tax ID"
          defaultValue={defaultValues.taxId}
          error={Boolean(state.fieldErrors?.taxId?.[0])}
          helperText={state.fieldErrors?.taxId?.[0]}
          fullWidth
        />
        <TextField
          size="small"
          name="address"
          label="Address"
          multiline
          minRows={3}
          defaultValue={defaultValues.address}
          error={Boolean(state.fieldErrors?.address?.[0])}
          helperText={state.fieldErrors?.address?.[0]}
          fullWidth
        />
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Company Logo
          </Typography>
          {companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogoUrl}
              alt="Company logo"
              style={{
                maxHeight: 72,
                width: "auto",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          ) : null}
          <Button
            variant="outlined"
            size="small"
            component="label"
            sx={{ alignSelf: "flex-start" }}
          >
            Upload logo
            <input hidden type="file" name="companyLogo" accept="image/*" />
          </Button>
        </Stack>
        <SectionActions isPending={isPending} onReset={onReset} />
      </Stack>
    </form>
  )
}

function PaymentTab({
  defaultValues,
  promptPayQrUrl,
  formKey,
  onReset,
}: {
  defaultValues: PlatformSettingsValues
  promptPayQrUrl: string | null
  formKey: string
  onReset: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettingsSection.bind(null, "payment"),
    initialState,
  )

  return (
    <form key={formKey} action={formAction}>
      <Stack spacing={2}>
        <StatusAlerts state={state} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <TextField
            size="small"
            name="bankName"
            label="Bank"
            defaultValue={defaultValues.bankName}
            sx={{ minWidth: 180, flex: 1 }}
          />
          <TextField
            size="small"
            name="accountName"
            label="Account Name"
            defaultValue={defaultValues.accountName}
            sx={{ minWidth: 180, flex: 1 }}
          />
          <TextField
            size="small"
            name="accountNumber"
            label="Account Number"
            defaultValue={defaultValues.accountNumber}
            sx={{ minWidth: 160, flex: 1 }}
          />
          <TextField
            size="small"
            name="bankBranch"
            label="Branch"
            defaultValue={defaultValues.bankBranch}
            sx={{ minWidth: 160, flex: 1 }}
          />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            PromptPay QR Upload
          </Typography>
          {promptPayQrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={promptPayQrUrl}
              alt="PromptPay QR"
              style={{
                maxHeight: 160,
                width: "auto",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          ) : null}
          <Button
            variant="outlined"
            size="small"
            component="label"
            sx={{ alignSelf: "flex-start" }}
          >
            Upload QR
            <input hidden type="file" name="promptPayQr" accept="image/*" />
          </Button>
        </Stack>
        <SectionActions isPending={isPending} onReset={onReset} />
      </Stack>
    </form>
  )
}

function StorageTab({
  defaultValues,
  formKey,
  onReset,
}: {
  defaultValues: PlatformSettingsValues
  formKey: string
  onReset: () => void
}) {
  const initialProvider =
    defaultValues.storageProvider === "r2" ? "s3" : defaultValues.storageProvider
  const [storageProvider, setStorageProvider] = React.useState(initialProvider)
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettingsSection.bind(null, "storage"),
    initialState,
  )

  useEffect(() => {
    setStorageProvider(initialProvider)
  }, [initialProvider, formKey])

  const isLocal = storageProvider === "local"

  return (
    <form key={formKey} action={formAction}>
      <Stack spacing={2}>
        <StatusAlerts state={state} />
        <TextField
          select
          size="small"
          name="storageProvider"
          label="Provider"
          value={storageProvider}
          onChange={(e) => setStorageProvider(e.target.value)}
          sx={{ maxWidth: 320 }}
        >
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="s3">AWS S3</MenuItem>
          <MenuItem value="gcs">Google Cloud</MenuItem>
          <MenuItem value="azure">Azure Blob</MenuItem>
        </TextField>

        {isLocal ? (
          <Alert severity="info">
            Files are stored on the application server under the local uploads
            directory.
          </Alert>
        ) : (
          <Alert severity="info">
            Access credentials for this provider are read from environment
            variables. Configure them in deployment settings.
          </Alert>
        )}

        {isLocal ? (
          <>
            <input
              type="hidden"
              name="bucketName"
              value={defaultValues.bucketName || "autohub-uploads"}
            />
            <input type="hidden" name="storageRegion" value="" />
          </>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <TextField
              size="small"
              name="bucketName"
              label={
                storageProvider === "azure" ? "Container Name" : "Bucket Name"
              }
              required
              defaultValue={defaultValues.bucketName}
              error={Boolean(state.fieldErrors?.bucketName?.[0])}
              helperText={state.fieldErrors?.bucketName?.[0]}
              sx={{ minWidth: 200, flex: 1 }}
            />
            <TextField
              size="small"
              name="storageRegion"
              label={
                storageProvider === "gcs"
                  ? "Location"
                  : storageProvider === "azure"
                    ? "Account / Region"
                    : "Region"
              }
              defaultValue={defaultValues.storageRegion}
              sx={{ minWidth: 180, flex: 1 }}
            />
          </Stack>
        )}

        <SectionActions isPending={isPending} onReset={onReset} />
      </Stack>
    </form>
  )
}

function SystemTab({
  defaultValues,
  formKey,
  onReset,
}: {
  defaultValues: PlatformSettingsValues
  formKey: string
  onReset: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettingsSection.bind(null, "system"),
    initialState,
  )

  return (
    <form key={formKey} action={formAction}>
      <Stack spacing={2}>
        <StatusAlerts state={state} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <TextField
            size="small"
            name="timeZone"
            label="Timezone"
            required
            defaultValue={defaultValues.timeZone}
            sx={{ minWidth: 200, flex: 1 }}
          />
          <TextField
            select
            size="small"
            name="language"
            label="Language"
            required
            defaultValue={defaultValues.language || "en"}
            sx={{ minWidth: 160, flex: 1 }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="th">Thai</MenuItem>
          </TextField>
          <TextField
            size="small"
            name="currency"
            label="Currency"
            required
            defaultValue={defaultValues.currency}
            sx={{ minWidth: 120, flex: 1 }}
          />
          <TextField
            select
            size="small"
            name="dateFormat"
            label="Date Format"
            required
            defaultValue={defaultValues.dateFormat}
            sx={{ minWidth: 160, flex: 1 }}
          >
            <MenuItem value="short">Short</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="long">Long</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            name="timeFormat"
            label="Time Format"
            required
            defaultValue={defaultValues.timeFormat}
            sx={{ minWidth: 160, flex: 1 }}
          >
            <MenuItem value="short">Short</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
          </TextField>
        </Stack>
        <SectionActions isPending={isPending} onReset={onReset} />
      </Stack>
    </form>
  )
}

export function PlatformSettingsForm({
  defaultValues,
  companyLogoUrl,
  promptPayQrUrl,
  initialTab = "billing",
}: PlatformSettingsFormProps) {
  const [tab, setTab] = React.useState<PlatformSettingsSection>(initialTab)
  const [resetToken, setResetToken] = React.useState(0)
  const formKey = `${tab}-${resetToken}`

  const updatedLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(defaultValues.updatedAt))

  const handleReset = () => setResetToken((value) => value + 1)

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          minHeight: 48,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: PlatformSettingsSection) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { height: 3 },
            "& .MuiTab-root": { minHeight: 40, px: 2, fontWeight: 600 },
          }}
        >
          {TABS.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          position: "sticky",
          top: 64,
          zIndex: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Last updated {updatedLabel}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Save applies to the active tab only.
        </Typography>
      </Paper>

      {tab === "billing" ? (
        <AdminSectionCard
          title="Billing"
          description="Fee and tax defaults snapshotted into new billings."
        >
          <BillingTab
            defaultValues={defaultValues}
            formKey={formKey}
            onReset={handleReset}
          />
        </AdminSectionCard>
      ) : null}

      {tab === "company" ? (
        <AdminSectionCard
          title="Company"
          description="Legal and brand identity for invoices and slips."
        >
          <CompanyTab
            defaultValues={defaultValues}
            companyLogoUrl={companyLogoUrl}
            formKey={formKey}
            onReset={handleReset}
          />
        </AdminSectionCard>
      ) : null}

      {tab === "payment" ? (
        <AdminSectionCard
          title="Payment"
          description="Bank account and PromptPay details shown to stores."
        >
          <PaymentTab
            defaultValues={defaultValues}
            promptPayQrUrl={promptPayQrUrl}
            formKey={formKey}
            onReset={handleReset}
          />
        </AdminSectionCard>
      ) : null}

      {tab === "storage" ? (
        <AdminSectionCard
          title="Storage"
          description="Object storage for uploads. Cloud credentials use environment variables."
        >
          <StorageTab
            defaultValues={defaultValues}
            formKey={formKey}
            onReset={handleReset}
          />
        </AdminSectionCard>
      ) : null}

      {tab === "system" ? (
        <AdminSectionCard
          title="System"
          description="Locale defaults for the admin and store portals."
        >
          <SystemTab
            defaultValues={defaultValues}
            formKey={formKey}
            onReset={handleReset}
          />
        </AdminSectionCard>
      ) : null}
    </Stack>
  )
}
