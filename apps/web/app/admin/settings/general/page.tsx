import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { requireAdminSession } from "@/lib/auth/require-admin"

export default async function AdminGeneralSettingsPage() {
  await requireAdminSession()

  return (
    <AdminLayout
      title="General"
      description="Locale and timezone defaults for the admin workspace."
    >
      <AdminSectionCard title="Locale & timezone">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Locale, timezone, and date/time formats are managed in Platform
            settings.
          </Typography>
          <Button
            href="/admin/settings/platform"
            variant="contained"
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            Open Platform settings
          </Button>
        </Stack>
      </AdminSectionCard>
    </AdminLayout>
  )
}
