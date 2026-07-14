"use client"

import Image from "next/image"
import Link from "next/link"
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { PORTALS } from "@/lib/auth/portals"

const MODULES = [
  {
    title: "Store approval",
    description: "Review claims and onboarding requests.",
    icon: AssignmentRoundedIcon,
    href: PORTALS.admin.login,
  },
  {
    title: "Billing",
    description: "Generate batches and approve payments.",
    icon: ReceiptLongRoundedIcon,
    href: PORTALS.admin.login,
  },
  {
    title: "Reports",
    description: "Export operational and financial data.",
    icon: AssessmentRoundedIcon,
    href: PORTALS.admin.login,
  },
  {
    title: "Jobs",
    description: "Monitor scheduled platform work.",
    icon: ScheduleRoundedIcon,
    href: PORTALS.admin.login,
  },
  {
    title: "Settings",
    description: "Company, bank, and fee configuration.",
    icon: SettingsRoundedIcon,
    href: PORTALS.admin.login,
  },
] as const

export function AdminLandingView() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(22,163,74,0.14), transparent 42%), radial-gradient(circle at 85% 20%, rgba(15,23,42,0.06), transparent 36%)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          mx: "auto",
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          maxWidth: 960,
          flexDirection: "column",
          px: { xs: 3, md: 4 },
          py: 4,
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Image
              src="/brand/autohub-wordmark.png"
              alt="AutoHub"
              width={160}
              height={28}
              style={{ height: 24, width: "auto" }}
              priority
            />
            <Chip size="small" label="Admin" variant="outlined" />
          </Stack>
          <Button component={Link} href={PORTALS.admin.login} color="inherit">
            Sign in
          </Button>
        </Stack>

        <Stack
          spacing={5}
          sx={{ flex: 1, justifyContent: "center", py: { xs: 6, md: 8 } }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: "0.14em" }}
            >
              Operations console
            </Typography>
            <Typography
              variant="h1"
              sx={{ mt: 1.5, fontSize: { xs: "2.25rem", sm: "3rem", md: "3.5rem" } }}
            >
              AutoHub Admin
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, maxWidth: 520, fontSize: { md: "1.125rem" } }}
            >
              Approve stores, settle billing, and keep the marketplace healthy —
              one workspace for platform operations.
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{ mt: 4, flexWrap: "wrap" }}
            >
              <Button
                component={Link}
                href={PORTALS.admin.login}
                variant="contained"
                size="large"
              >
                Continue with LINE
              </Button>
              <Button
                component={Link}
                href="/admin/dashboard"
                variant="outlined"
                size="large"
              >
                Open dashboard
              </Button>
            </Stack>
          </Box>

          <Box>
            <Stack
              direction="row"
              sx={{
                mb: 2,
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2">Workspace modules</Typography>
              <Typography variant="caption" color="text.secondary">
                Sign in to access each area
              </Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {MODULES.map((item) => {
                const Icon = item.icon
                return (
                  <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: "100%" }}>
                      <CardActionArea
                        component={Link}
                        href={item.href}
                        sx={{ height: "100%" }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              mb: 1.5,
                              display: "inline-flex",
                              p: 1,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                              color: "text.secondary",
                            }}
                          >
                            <Icon fontSize="small" />
                          </Box>
                          <Typography variant="subtitle2">
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {item.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ borderTop: 1, borderColor: "divider", pt: 2.5 }}
        >
          Restricted access · AutoHub platform operators only
        </Typography>
      </Box>
    </Box>
  )
}
