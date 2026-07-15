import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminJobsTable } from "@/components/admin/admin-jobs-table"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getJobsOverview } from "@/lib/jobs/queries"

function formatDateTime(value?: Date | null): string {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

function formatDuration(value?: number | null): string {
  if (!value || value <= 0) return "-"
  return `${value} ms`
}

export default async function AdminSchedulerPage() {
  await requireAdminSession()
  const jobs = await getJobsOverview()

  return (
    <AdminLayout
      title="Scheduler"
      description="Centralized scheduler registry and execution history."
    >
      <AdminJobsTable
        jobs={jobs.map((job) => ({
          name: job.name,
          description: job.description,
          schedule: job.schedule,
          lastRunAt: formatDateTime(job.lastRun?.startedAt),
          lastStatus: job.lastRun?.status ?? "-",
          lastDuration: formatDuration(job.lastRun?.duration),
          nextRunAt: formatDateTime(job.nextRun),
          enabled: job.enabled,
        }))}
      />
    </AdminLayout>
  )
}
