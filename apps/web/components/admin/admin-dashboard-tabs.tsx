"use client"

import * as React from "react"
import Link from "next/link"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Alert from "@mui/material/Alert"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import BlockRoundedIcon from "@mui/icons-material/BlockRounded"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card"
import { AdminBarChart } from "@/components/admin/ui/admin-bar-chart"

type ChartPoint = { label: string; value: number }

type TodoTask = {
  id: string
  title: string
  count: number
  description: string
  actionLabel: string
  href: string
  tone: "amber" | "sky" | "emerald" | "rose"
}

type ActivityItem = {
  id: string
  category: "claim" | "payment" | "billing" | "suspended"
  title: string
  detail: string
  at: string
  href?: string
}

type SystemAlert = {
  id: string
  title: string
  detail: string
  severity: "warning" | "error" | "info"
  href?: string
}

export type AdminDashboardTabsProps = {
  initialTab?: "todo" | "kpi"
  todo: {
    tasks: TodoTask[]
    activity: ActivityItem[]
    alerts: SystemAlert[]
  }
  kpi: {
    store: Array<{ label: string; value: string | number }>
    customer: Array<{ label: string; value: string | number }>
    operations: Array<{ label: string; value: string | number }>
    bookingTrend7: ChartPoint[]
    bookingTrend30: ChartPoint[]
    revenueTrend: ChartPoint[]
    storeGrowth: ChartPoint[]
    billingStatus: ChartPoint[]
  }
}

const TONE_MAP = {
  amber: "warning",
  sky: "info",
  emerald: "primary",
  rose: "error",
} as const

const ACTIVITY_ICON = {
  claim: AssignmentRoundedIcon,
  payment: PaymentRoundedIcon,
  billing: ReceiptLongRoundedIcon,
  suspended: BlockRoundedIcon,
} as const

function formatChartCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function AdminDashboardTabs({
  initialTab = "todo",
  todo,
  kpi,
}: AdminDashboardTabsProps) {
  const [tab, setTab] = React.useState<"todo" | "kpi">(initialTab)
  const openTaskCount = todo.tasks.reduce((sum, task) => sum + task.count, 0)

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: "todo" | "kpi") => setTab(value)}
          sx={{
            minHeight: 40,
            bgcolor: "action.hover",
            borderRadius: 2,
            p: 0.5,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 34,
              borderRadius: 1.5,
              px: 2,
            },
            "& .Mui-selected": {
              bgcolor: "background.paper",
              boxShadow: 1,
            },
          }}
        >
          <Tab
            value="todo"
            label={
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <span>To Do</span>
                {openTaskCount > 0 ? (
                  <Chip size="small" color="secondary" label={openTaskCount} />
                ) : null}
              </Stack>
            }
          />
          <Tab value="kpi" label="KPI" />
        </Tabs>
        <Typography variant="caption" color="text.secondary">
          {tab === "todo"
            ? "Complete today's operational work"
            : "Read-only platform insights"}
        </Typography>
      </Box>

      {tab === "todo" ? (
        <Stack spacing={3} sx={{ pt: 2.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Pending Tasks
            </Typography>
            <Grid container spacing={2}>
              {todo.tasks.map((task) => (
                <Grid key={task.id} size={{ xs: 12, sm: 6 }}>
                  <AdminStatCard
                    label={task.title}
                    value={task.count}
                    description={task.description}
                    href={task.href}
                    actionLabel={task.actionLabel}
                    tone={TONE_MAP[task.tone]}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <AdminSectionCard title="Recent Activity">
                {todo.activity.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {todo.activity.map((item) => {
                      const Icon = ACTIVITY_ICON[item.category]
                      return (
                        <ListItem
                          key={item.id}
                          component={item.href ? Link : "div"}
                          href={item.href}
                          sx={{
                            px: 0,
                            borderRadius: 2,
                            "&:hover": item.href
                              ? { bgcolor: "action.hover" }
                              : undefined,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Icon fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={`${item.detail} · ${item.at}`}
                            slotProps={{
                              primary: {
                                variant: "body2",
                                sx: { fontWeight: 600 },
                              },
                              secondary: { variant: "caption" },
                            }}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                )}
              </AdminSectionCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <AdminSectionCard title="System Alerts">
                <Stack spacing={1.25}>
                  {todo.alerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={alert.severity}
                      action={
                        alert.href ? (
                          <Button
                            component={Link}
                            href={alert.href}
                            color="inherit"
                            size="small"
                          >
                            Investigate
                          </Button>
                        ) : undefined
                      }
                    >
                      <Typography variant="subtitle2">{alert.title}</Typography>
                      <Typography variant="body2">{alert.detail}</Typography>
                    </Alert>
                  ))}
                </Stack>
              </AdminSectionCard>
            </Grid>
          </Grid>
        </Stack>
      ) : (
        <Stack spacing={3} sx={{ pt: 2.5 }}>
          <KpiGroup title="Store" cards={kpi.store} />
          <KpiGroup title="Customer" cards={kpi.customer} />
          <KpiGroup title="Operations" cards={kpi.operations} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Analytics
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Booking Trend (7 days)"
                  points={kpi.bookingTrend7}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Booking Trend (30 days)"
                  points={kpi.bookingTrend30}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Revenue Trend"
                  points={kpi.revenueTrend}
                  valueFormatter={formatChartCurrency}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart title="Store Growth" points={kpi.storeGrowth} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Billing Status"
                  points={kpi.billingStatus}
                  valueFormatter={formatChartCurrency}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      )}
    </Box>
  )
}

function KpiGroup({
  title,
  cards,
}: {
  title: string
  cards: Array<{ label: string; value: string | number }>
}) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <AdminStatCard label={card.label} value={card.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
