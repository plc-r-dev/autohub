import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminJobsLoading() {
  return (
    <AdminLayout title="Background jobs" description="Loading jobs...">
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-md bg-muted" />
        <div className="h-56 rounded-md bg-muted" />
      </div>
    </AdminLayout>
  );
}
