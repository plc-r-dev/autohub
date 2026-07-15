"use client"

import Link from "next/link"
import { useTransition } from "react"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import FormControlLabel from "@mui/material/FormControlLabel"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import {
  runJobNowAction,
  setJobEnabledAction,
} from "@/lib/jobs/actions"

type JobRow = {
  name: string
  description: string
  schedule: string
  lastRunAt: string
  lastStatus: string
  lastDuration: string
  nextRunAt: string
  enabled: boolean
}

type AdminJobsTableProps = {
  jobs: JobRow[]
}

function statusColor(
  status: string,
): "default" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "SUCCESS":
      return "success"
    case "FAILED":
      return "error"
    case "RUNNING":
      return "info"
    case "SKIPPED":
      return "warning"
    default:
      return "default"
  }
}

function JobEnableSwitch({
  jobName,
  enabled,
}: {
  jobName: string
  enabled: boolean
}) {
  const [pending, startTransition] = useTransition()
  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={enabled}
          disabled={pending}
          onChange={(_, checked) => {
            startTransition(async () => {
              await setJobEnabledAction(jobName, checked)
            })
          }}
        />
      }
      label={enabled ? "Enabled" : "Disabled"}
      sx={{ mr: 0 }}
    />
  )
}

function RunJobButton({ jobName }: { jobName: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="small"
      variant="outlined"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await runJobNowAction(jobName)
        })
      }}
    >
      {pending ? "Running…" : "Run now"}
    </Button>
  )
}

export function AdminJobsTable({ jobs }: AdminJobsTableProps) {
  return (
    <AdminSectionCard
      title="Scheduler"
      description="Enable or disable jobs, run one at a time, and inspect logs."
    >
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Job</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Next Run</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.name} hover>
                <TableCell>
                  <Stack spacing={0.25}>
                    <span style={{ fontWeight: 600 }}>{job.name}</span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      {job.description}
                    </span>
                  </Stack>
                </TableCell>
                <TableCell>{job.schedule}</TableCell>
                <TableCell>{job.lastRunAt}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={job.lastStatus}
                    color={statusColor(job.lastStatus)}
                  />
                </TableCell>
                <TableCell>{job.lastDuration}</TableCell>
                <TableCell>{job.nextRunAt}</TableCell>
                <TableCell>
                  <JobEnableSwitch jobName={job.name} enabled={job.enabled} />
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "flex-end" }}
                  >
                    <RunJobButton jobName={job.name} />
                    <Button
                      component={Link}
                      href={`/admin/settings/scheduler/${encodeURIComponent(job.name)}`}
                      size="small"
                      variant="text"
                    >
                      Logs
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminSectionCard>
  )
}
