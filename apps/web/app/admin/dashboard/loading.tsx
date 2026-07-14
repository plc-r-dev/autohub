import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminDashboardLoading() {
  return (
    <AdminLayout title="Platform dashboard" description="Loading workspace...">
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={40} width={280} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
        </Stack>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <Skeleton variant="rounded" height={220} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={220} sx={{ flex: 1 }} />
        </Stack>
      </Stack>
    </AdminLayout>
  )
}
