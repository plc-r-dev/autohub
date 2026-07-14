import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { notFound } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { AdminStatusChip } from "@/components/admin/ui/admin-status-chip"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { ensureJobDefinitionsRegistered } from "@/lib/jobs/definitions"
import { getJobExecutionLogs, getJobsOverview } from "@/lib/jobs/queries"
import { getRegisteredJob } from "@/lib/jobs/registry"

type PageProps = {
  params: Promise<{ jobName: string }>
}

function formatDateTime(value?: Date | null): string {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export default async function AdminJobLogsPage({ params }: PageProps) {
  await requireAdminSession()
  ensureJobDefinitionsRegistered()
  const { jobName } = await params

  const decoded = decodeURIComponent(jobName)
  const job = getRegisteredJob(decoded)
  if (!job) {
    notFound()
  }

  const [logs, jobs] = await Promise.all([
    getJobExecutionLogs(decoded, 100),
    getJobsOverview(),
  ])
  const selected = jobs.find((entry) => entry.name === decoded)

  return (
    <AdminLayout title={`Job logs — ${decoded}`} description={job.description}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="body2" color="text.secondary">
          Schedule: {selected?.schedule ?? "-"}
        </Typography>
        <Button href="/admin/jobs" variant="outlined" size="small">
          Back to jobs
        </Button>
      </Stack>

      <AdminSectionCard title="Execution history">
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Started</TableCell>
                <TableCell>Finished</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attempt</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      No logs yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDateTime(log.startedAt)}</TableCell>
                    <TableCell>{formatDateTime(log.finishedAt)}</TableCell>
                    <TableCell>{log.duration ?? "-"}</TableCell>
                    <TableCell>
                      <AdminStatusChip label={log.status} status={log.status} />
                    </TableCell>
                    <TableCell>{log.attempt}</TableCell>
                    <TableCell>{log.message ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminSectionCard>
    </AdminLayout>
  )
}
