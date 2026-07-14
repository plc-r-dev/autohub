"use client"

import Image from "next/image"
import Link from "next/link"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded"
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ServiceStorePortalUserMenu } from "@/components/service-store/service-store-portal-user-menu"
import { roleLabel } from "@/lib/service-store/domain"
import { switchActiveServiceStore } from "@/lib/service-store/member-actions"
import type {
  PendingServiceStoreApplication,
  ServiceStoreWorkspaceSummary,
} from "@/lib/service-store/application/member-queries"

const ADD_STORE_HREF = "/app?mode=onboard"

const addCardHoverSx = {
  borderColor: "primary.main",
  bgcolor: "rgba(22,163,74,0.04)",
  boxShadow: "0 8px 24px rgba(22, 163, 74, 0.08)",
} as const

function storeInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

function statusChip(status: string) {
  if (status === "ACTIVE" || status === "READY_FOR_BOOKING") {
    return { label: "Active", color: "success" as const }
  }
  if (status === "SUSPENDED") {
    return { label: "Suspended", color: "error" as const }
  }
  return { label: status.replaceAll("_", " "), color: "default" as const }
}

function StoreSelectionHeader({
  displayName,
  avatarUrl,
}: {
  displayName: string
  avatarUrl: string | null
}) {
  return (
    <Stack
      direction="row"
      sx={{
        mb: 4,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Image
        src="/brand/autohub-wordmark.png"
        alt="AutoHub"
        width={140}
        height={24}
        style={{ height: 24, width: "auto" }}
        priority
      />
      <ServiceStorePortalUserMenu
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
    </Stack>
  )
}

type StoreSelectionViewProps = {
  displayName: string
  avatarUrl: string | null
  summaries: ServiceStoreWorkspaceSummary[]
  pendingApplications?: PendingServiceStoreApplication[]
  activeServiceStoreId: string | null
}

export function StoreSelectionView({
  displayName,
  avatarUrl,
  summaries,
  pendingApplications = [],
  activeServiceStoreId,
}: StoreSelectionViewProps) {
  const hasPendingOnly = summaries.length === 0 && pendingApplications.length > 0

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ mx: "auto", width: "100%", maxWidth: 1100 }}>
        <StoreSelectionHeader
          displayName={displayName}
          avatarUrl={avatarUrl}
        />

        <Box sx={{ mb: 4, maxWidth: 560 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {hasPendingOnly ? "Your Service Store" : "Choose a Service Store"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {hasPendingOnly
              ? "Your application was submitted and is waiting for admin approval."
              : "Select the service store you want to manage."}
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {summaries.map((summary) => {
            const chip = statusChip(summary.serviceStore.status)
            const isActive = activeServiceStoreId === summary.serviceStore.id
            return (
              <Grid key={summary.serviceStore.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    outline: isActive ? "2px solid" : "none",
                    outlineColor: "primary.main",
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar
                          src={summary.serviceStore.logoUrl ?? undefined}
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.main",
                            fontWeight: 700,
                          }}
                        >
                          {summary.serviceStore.logoUrl
                            ? null
                            : storeInitials(summary.serviceStore.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                            noWrap
                          >
                            {summary.serviceStore.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {summary.primaryBranchName ??
                              summary.serviceStore.code}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Chip
                          size="small"
                          label={roleLabel(summary.role)}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={chip.label}
                          color={chip.color}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${summary.branchCount} branch${summary.branchCount === 1 ? "" : "es"}`}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <form
                      action={switchActiveServiceStore.bind(
                        null,
                        summary.serviceStore.id,
                      )}
                      style={{ width: "100%" }}
                    >
                      <Button type="submit" variant="contained" fullWidth>
                        Open
                      </Button>
                    </form>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}

          {pendingApplications.map((application) => (
            <Grid key={application.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  outline: "2px solid",
                  outlineColor: "warning.main",
                  outlineOffset: -1,
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center" }}
                    >
                      <Avatar
                        src={application.logoUrl ?? undefined}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        {application.logoUrl
                          ? null
                          : storeInitials(application.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                          noWrap
                        >
                          {application.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.code ?? application.name}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ flexWrap: "wrap" }}
                    >
                      <Chip
                        size="small"
                        label={application.type === "claim" ? "Claim" : "Create"}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label="Wait for approval"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`${application.branchCount} branch${application.branchCount === 1 ? "" : "es"}`}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button variant="contained" fullWidth disabled>
                    Wait for approval
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
              component={Link}
              href={ADD_STORE_HREF}
              sx={{
                height: "100%",
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: "rgba(22,163,74,0.35)",
                bgcolor: "rgba(22,163,74,0.02)",
                boxShadow: "none",
                transition:
                  "border-color 0.18s, background-color 0.18s, box-shadow 0.18s",
                "&:hover": addCardHoverSx,
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  py: 3,
                }}
              >
                <Stack spacing={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    <AddRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Add a Service Store
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Claim an existing shop or create a new one on AutoHub.
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      icon={<HowToRegRoundedIcon />}
                      label="Claim"
                      variant="outlined"
                      color="success"
                    />
                    <Chip
                      size="small"
                      icon={<StorefrontRoundedIcon />}
                      label="Create"
                      variant="outlined"
                      color="success"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

type StoreEmptyViewProps = {
  displayName: string
  avatarUrl: string | null
}

export function StoreEmptyView({
  displayName,
  avatarUrl,
}: StoreEmptyViewProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ mx: "auto", width: "100%", maxWidth: 1100 }}>
        <StoreSelectionHeader
          displayName={displayName}
          avatarUrl={avatarUrl}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: { xs: 2, md: 6 },
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 520,
              overflow: "hidden",
              borderColor: "rgba(22,163,74,0.2)",
            }}
          >
            <Box
              sx={{
                height: 6,
                background:
                  "linear-gradient(90deg, #16A34A 0%, #4ADE80 100%)",
              }}
            />
            <CardContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3.5, sm: 4 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "rgba(22,163,74,0.12)",
                      color: "primary.main",
                    }}
                  >
                    <StorefrontRoundedIcon fontSize="large" />
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Add a Service Store
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75 }}
                    >
                      {displayName ? `Hi ${displayName}. ` : ""}
                      You don&apos;t have a workspace yet — claim an existing
                      shop or create a new one to get started.
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: "wrap" }}
                >
                  <Chip
                    size="small"
                    icon={<HowToRegRoundedIcon />}
                    label="Claim existing"
                    variant="outlined"
                    color="success"
                  />
                  <Chip
                    size="small"
                    icon={<StorefrontRoundedIcon />}
                    label="Create new"
                    variant="outlined"
                    color="success"
                  />
                </Stack>

                <Button
                  component={Link}
                  href={ADD_STORE_HREF}
                  variant="contained"
                  size="large"
                  startIcon={<AddRoundedIcon />}
                  fullWidth
                >
                  Add a Service Store
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
