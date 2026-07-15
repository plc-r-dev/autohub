"use client"

import * as React from "react"
import Link from "next/link"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
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

export type AdminDashboardTabsProps = {
  initialTab?: "todo" | "kpi"
  todo: {
    tasks: TodoTask[]
    activity: ActivityItem[]
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: 1280,
        mx: "auto",
        width: "100%",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          px: 1.5,
          py: 1,
          border: 1,
          borderColor: "divider",
          borderRadius: 2.5,
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: "todo" | "kpi") => setTab(value)}
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            "& .MuiTab-root": {
              minHeight: 40,
              px: 2,
              fontWeight: 600,
            },
          }}
        >
          <Tab
            value="todo"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <span>Operations</span>
                {openTaskCount > 0 ? (
                  <Chip size="small" color="secondary" label={openTaskCount} />
                ) : null}
              </Stack>
            }
          />
          <Tab value="kpi" label="KPI" />
        </Tabs>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 1, display: { xs: "none", sm: "block" } }}
        >
          {tab === "todo"
            ? "Complete today's operational work"
            : "Read-only platform insights"}
        </Typography>
      </Paper>

      {tab === "todo" ? (
        <Stack spacing={3}>
          <Box>
            <SectionHeading
              title="Pending tasks"
              subtitle="Jump into work that needs attention"
            />
            <Grid container spacing={2}>
              {todo.tasks.map((task) => (
                <Grid key={task.id} size={{ xs: 12, sm: 6, xl: 3 }}>
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

          <AdminSectionCard
            title="Recent activity"
            description="Latest claims, payments, and store events"
          >
            {todo.activity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent activity.
              </Typography>
            ) : (
              <List disablePadding sx={{ mx: -1 }}>
                {todo.activity.map((item) => {
                  const Icon = ACTIVITY_ICON[item.category]
                  return (
                    <ListItem
                      key={item.id}
                      component={item.href ? Link : "div"}
                      href={item.href}
                      sx={{
                        px: 1,
                        py: 1.25,
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
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Box>
            <SectionHeading
              title="At a glance"
              subtitle="Today's operations and platform totals"
            />
            <Grid container spacing={2}>
              {[...kpi.operations, ...kpi.store, ...kpi.customer].map((card) => (
                <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                  <AdminStatCard label={card.label} value={card.value} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <SectionHeading
              title="Analytics"
              subtitle="Booking, revenue, growth, and billing trends"
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Booking trend (7 days)"
                  points={kpi.bookingTrend7}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Booking trend (30 days)"
                  points={kpi.bookingTrend30}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Revenue trend"
                  points={kpi.revenueTrend}
                  valueFormatter={formatChartCurrency}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart title="Store growth" points={kpi.storeGrowth} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminBarChart
                  title="Billing status"
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

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <Stack spacing={0.25} sx={{ mb: 1.75 }}>
      <Typography variant="h2" component="h2">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  )
}
