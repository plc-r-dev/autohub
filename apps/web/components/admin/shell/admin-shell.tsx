"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded"
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { AdminSignOutButton } from "@/components/admin/ui/admin-sign-out-button"
import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/components/admin/shell/admin-nav"

const DRAWER_WIDTH = 248

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/admin/dashboard": <DashboardRoundedIcon fontSize="small" />,
  "/admin/service-store-requests": <AssignmentRoundedIcon fontSize="small" />,
  "/admin/billings": <ReceiptLongRoundedIcon fontSize="small" />,
  "/admin/reports": <AssessmentRoundedIcon fontSize="small" />,
  "/admin/jobs": <ScheduleRoundedIcon fontSize="small" />,
  "/admin/settings": <SettingsRoundedIcon fontSize="small" />,
}

type AdminShellProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ gap: 1.25, px: 2.5 }}>
        <Image
          src="/brand/autohub-wordmark.png"
          alt="AutoHub"
          width={120}
          height={22}
          style={{ height: 22, width: "auto" }}
        />
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            lineHeight: 1,
            mt: 0.25,
          }}
        >
          Admin
        </Typography>
      </Toolbar>
      <List sx={{ flex: 1, py: 1 }}>
        {ADMIN_NAV_ITEMS.map((item) => {
          const selected = isAdminNavActive(pathname, item)
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {NAV_ICONS[item.href]}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { variant: "body2", sx: { fontWeight: 600 } },
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Platform operations
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: "none" } }}
            aria-label="Open navigation"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" noWrap>
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary" noWrap>
                {description}
              </Typography>
            ) : null}
          </Box>
          {actions}
          <AdminSignOutButton />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Box
          sx={{
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
