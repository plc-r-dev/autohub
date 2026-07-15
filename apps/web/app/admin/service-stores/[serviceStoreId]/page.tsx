import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { notFound } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getAdminServiceStoreDetail } from "@/lib/service-store/admin-queries"

type PageProps = {
  params: Promise<{ serviceStoreId: string }>
}

function memberLabel(member: {
  role: string
  user: {
    firstName: string
    lastName: string
    email: string | null
  }
}): string {
  const name =
    [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") ||
    member.user.email ||
    "Unknown"
  return `${name} · ${member.role}`
}

export default async function AdminServiceStoreDetailPage({
  params,
}: PageProps) {
  await requireAdminSession()
  const { serviceStoreId } = await params
  const store = await getAdminServiceStoreDetail(serviceStoreId)

  if (!store) {
    notFound()
  }

  return (
    <AdminLayout
      title={store.name}
      description={`${store.code} · Service store details`}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button
            href="/admin/service-stores/active"
            variant="outlined"
            size="small"
          >
            Back to active list
          </Button>
        </Stack>

        <AdminSectionCard
          title="Store details"
          action={<AdminStatusChip label={store.status} status={store.status} />}
        >
          <Stack spacing={1}>
            <Typography variant="body2">Code: {store.code}</Typography>
            <Typography variant="body2">
              Booking: {store.bookingEnabled ? "Enabled" : "Off"}
            </Typography>
            <Typography variant="body2">Phone: {store.phone ?? "—"}</Typography>
            <Typography variant="body2">Email: {store.email ?? "—"}</Typography>
            <Typography variant="body2">
              Website: {store.website ?? "—"}
            </Typography>
            <Typography variant="body2">
              Address: {store.address ?? "—"}
            </Typography>
            {store.description ? (
              <Typography variant="body2" color="text.secondary">
                {store.description}
              </Typography>
            ) : null}
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="Branches">
          {store.branches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No branches.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {store.branches.map((branch) => (
                <Typography key={branch.id} variant="body2">
                  {branch.name} ({branch.code})
                </Typography>
              ))}
            </Stack>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Members">
          {store.members.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No members.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {store.members.map((member) => (
                <Typography key={member.id} variant="body2">
                  {memberLabel(member)}
                </Typography>
              ))}
            </Stack>
          )}
        </AdminSectionCard>
      </Stack>
    </AdminLayout>
  )
}
