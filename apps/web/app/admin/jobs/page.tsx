import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { runAllJobsNowAction, runJobNowAction } from "@/lib/jobs/actions";
import { getJobsOverview } from "@/lib/jobs/queries";

function formatDateTime(value?: Date | null): string {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatDuration(value?: number | null): string {
  if (!value || value <= 0) {
    return "-";
  }
  return `${value} ms`;
}

export default async function AdminJobsPage() {
  await requireLinkedIdentity();
  const jobs = await getJobsOverview();

  return (
    <AdminLayout
      title="Background jobs"
      description="Centralized scheduler registry and execution history."
    >
      <div className="flex justify-end">
        <form action={runAllJobsNowAction}>
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
          >
            Run all now
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Job Name</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Schedule</th>
                <th className="px-3 py-2 font-medium">Last Run</th>
                <th className="px-3 py-2 font-medium">Last Status</th>
                <th className="px-3 py-2 font-medium">Last Duration</th>
                <th className="px-3 py-2 font-medium">Next Run</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.name} className="border-t align-top">
                  <td className="px-3 py-2 font-medium">{job.name}</td>
                  <td className="px-3 py-2">{job.description}</td>
                  <td className="px-3 py-2">{job.schedule}</td>
                  <td className="px-3 py-2">{formatDateTime(job.lastRun?.startedAt)}</td>
                  <td className="px-3 py-2">{job.lastRun?.status ?? "-"}</td>
                  <td className="px-3 py-2">{formatDuration(job.lastRun?.duration)}</td>
                  <td className="px-3 py-2">{formatDateTime(job.nextRun)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <form action={runJobNowAction.bind(null, job.name)}>
                        <button
                          type="submit"
                          className="border-input hover:bg-muted rounded-md border px-3 py-1.5"
                        >
                          Run now
                        </button>
                      </form>
                      <Link
                        href={`/admin/jobs/${encodeURIComponent(job.name)}`}
                        className="border-input hover:bg-muted rounded-md border px-3 py-1.5"
                      >
                        View logs
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
