import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { ensureJobDefinitionsRegistered } from "@/lib/jobs/definitions";
import { getJobExecutionLogs, getJobsOverview } from "@/lib/jobs/queries";
import { getRegisteredJob } from "@/lib/jobs/registry";

type PageProps = {
  params: Promise<{ jobName: string }>;
};

function formatDateTime(value?: Date | null): string {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminJobLogsPage({ params }: PageProps) {
  await requireAdminSession();
  ensureJobDefinitionsRegistered();
  const { jobName } = await params;

  const decoded = decodeURIComponent(jobName);
  const job = getRegisteredJob(decoded);
  if (!job) {
    notFound();
  }

  const [logs, jobs] = await Promise.all([
    getJobExecutionLogs(decoded, 100),
    getJobsOverview(),
  ]);
  const selected = jobs.find((entry) => entry.name === decoded);

  return (
    <AdminLayout title={`Job logs — ${decoded}`} description={job.description}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Schedule: {selected?.schedule ?? "-"}
        </p>
        <Link
          href="/admin/jobs"
          className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
        >
          Back to jobs
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Started</th>
                <th className="px-3 py-2 font-medium">Finished</th>
                <th className="px-3 py-2 font-medium">Duration</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Attempt</th>
                <th className="px-3 py-2 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                    No logs yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t align-top">
                    <td className="px-3 py-2">{formatDateTime(log.startedAt)}</td>
                    <td className="px-3 py-2">{formatDateTime(log.finishedAt)}</td>
                    <td className="px-3 py-2">{log.duration ?? "-"}</td>
                    <td className="px-3 py-2">{log.status}</td>
                    <td className="px-3 py-2">{log.attempt}</td>
                    <td className="px-3 py-2">{log.message ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
