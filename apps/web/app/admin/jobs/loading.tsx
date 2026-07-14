import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminJobsLoading() {
  return (
    <AdminLayout title="Background jobs" description="Loading jobs...">
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={280} />
      </Stack>
    </AdminLayout>
  )
}
