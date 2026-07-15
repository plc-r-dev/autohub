"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ListSubheader from "@mui/material/ListSubheader"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { AdminSignOutButton } from "@/components/admin/ui/admin-sign-out-button"
import {
  ADMIN_NAV_SECTIONS,
  isAdminNavActive,
  isAdminNavGroupActive,
  type AdminNavItem,
} from "@/components/admin/shell/admin-nav"

const DRAWER_WIDTH = 260

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/admin/dashboard": <DashboardRoundedIcon fontSize="small" />,
  "/admin/service-stores": <StorefrontRoundedIcon fontSize="small" />,
  "/admin/billings": <ReceiptLongRoundedIcon fontSize="small" />,
  "/admin/reports": <AssessmentRoundedIcon fontSize="small" />,
  "/admin/settings/general": <SettingsRoundedIcon fontSize="small" />,
  "/admin/settings/platform": <SettingsRoundedIcon fontSize="small" />,
  "/admin/settings/scheduler": <ScheduleRoundedIcon fontSize="small" />,
  "/admin/settings/audit-logs": <AssignmentRoundedIcon fontSize="small" />,
}

type AdminShellProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

function NavItem({
  item,
  onNavigate,
}: {
  item: AdminNavItem
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const hasChildren = Boolean(item.children?.length)
  const groupActive = isAdminNavGroupActive(pathname, item)
  const [open, setOpen] = React.useState(groupActive)

  React.useEffect(() => {
    if (groupActive) setOpen(true)
  }, [groupActive])

  if (!hasChildren) {
    const selected = isAdminNavActive(pathname, item)
    return (
      <ListItemButton
        component={Link}
        href={item.href}
        selected={selected}
        onClick={onNavigate}
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
  }

  const defaultChild = item.children![0]!

  return (
    <>
      <ListItemButton
        selected={groupActive && !open}
        onClick={() => setOpen((value) => !value)}
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
        {open ? (
          <ExpandLess fontSize="small" />
        ) : (
          <ExpandMore fontSize="small" />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children!.map((child) => {
            const selected = isAdminNavActive(pathname, child)
            return (
              <ListItemButton
                key={child.href}
                component={Link}
                href={child.href}
                selected={selected}
                onClick={onNavigate}
                sx={{ pl: 5.5 }}
              >
                <ListItemText
                  primary={child.label}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      sx: { fontWeight: selected ? 700 : 500 },
                    },
                  }}
                />
              </ListItemButton>
            )
          })}
          {/* Keep parent href discoverable for deep links */}
          <Box component="span" sx={{ display: "none" }}>
            {defaultChild.href}
          </Box>
        </List>
      </Collapse>
    </>
  )
}

export function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
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

      {ADMIN_NAV_SECTIONS.map((section) => (
        <List
          key={section.id}
          dense
          subheader={
            <ListSubheader
              component="div"
              sx={{
                bgcolor: "transparent",
                lineHeight: 2.5,
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {section.label}
            </ListSubheader>
          }
          sx={{ py: 0.5 }}
        >
          {section.items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </List>
      ))}

      <Box sx={{ flex: 1 }} />
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Daily ops above · Platform admin in Settings
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}
    >
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
