import Button from "@mui/material/Button"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { getAdminAuditLogs } from "@/lib/reporting/audit-logs"

export default async function AdminAuditLogsPage() {
  await requireAdminSession()
  const logs = await getAdminAuditLogs()

  return (
    <AdminLayout
      title="Audit logs"
      description="Recent admin-facing actions across claims, billings, and stores."
    >
      <AdminSectionCard title="Recent activity">
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Detail</TableCell>
                <TableCell>When</TableCell>
                <TableCell align="right">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      No audit events yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.detail}</TableCell>
                    <TableCell>{log.at}</TableCell>
                    <TableCell align="right">
                      {log.href ? (
                        <Button href={log.href} size="small" variant="text">
                          View
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
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
