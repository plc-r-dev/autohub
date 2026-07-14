"use client"

import Link from "next/link"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"

type JobRow = {
  name: string
  description: string
  schedule: string
  lastRunAt: string
  lastStatus: string
  lastDuration: string
  nextRunAt: string
}

type AdminJobsTableProps = {
  jobs: JobRow[]
  runAllAction: () => Promise<void>
  runJobAction: (jobName: string) => Promise<void>
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

export function AdminJobsTable({
  jobs,
  runAllAction,
  runJobAction,
}: AdminJobsTableProps) {
  return (
      <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <form action={runAllAction}>
          <Button type="submit" variant="contained">
            Run all now
          </Button>
        </form>
      </Stack>

      <AdminSectionCard title="Job registry">
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell>Job Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.name} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{job.name}</TableCell>
                  <TableCell>{job.description}</TableCell>
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
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <form action={runJobAction.bind(null, job.name)}>
                        <Button type="submit" size="small" variant="outlined">
                          Run now
                        </Button>
                      </form>
                      <Button
                        component={Link}
                        href={`/admin/jobs/${encodeURIComponent(job.name)}`}
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
    </Stack>
  )
}
