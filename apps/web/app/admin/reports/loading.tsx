import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminReportsLoading() {
  return (
    <AdminLayout title="Reports" description="Loading reports...">
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
      </Stack>
    </AdminLayout>
  )
}
