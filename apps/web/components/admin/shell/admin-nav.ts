export type AdminNavLeaf = {
  href: string
  label: string
  match?: "exact" | "prefix"
}

export type AdminNavItem = AdminNavLeaf & {
  children?: AdminNavLeaf[]
}

export type AdminNavSection = {
  id: "operations" | "system"
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", match: "prefix" },
      {
        href: "/admin/service-stores",
        label: "Service Stores",
        match: "prefix",
        children: [
          {
            href: "/admin/service-stores/active",
            label: "Active Stores",
            match: "prefix",
          },
          {
            href: "/admin/service-stores/claims",
            label: "Store Claims",
            match: "prefix",
          },
        ],
      },
      {
        href: "/admin/billings",
        label: "Billing",
        match: "prefix",
        children: [
          {
            href: "/admin/billings/payment-review",
            label: "Payment Review",
            match: "prefix",
          },
          {
            href: "/admin/billings/history",
            label: "Billing History",
            match: "prefix",
          },
        ],
      },
      { href: "/admin/reports", label: "Reports", match: "prefix" },
    ],
  },
  {
    id: "system",
    label: "Settings",
    items: [
      {
        href: "/admin/settings/general",
        label: "General",
        match: "prefix",
      },
      {
        href: "/admin/settings/platform",
        label: "Platform",
        match: "prefix",
      },
      {
        href: "/admin/settings/scheduler",
        label: "Scheduler",
        match: "prefix",
      },
      {
        href: "/admin/settings/audit-logs",
        label: "Audit Logs",
        match: "prefix",
      },
    ],
  },
]

export function isAdminNavActive(
  pathname: string,
  item: AdminNavLeaf,
): boolean {
  if (item.match === "exact") {
    return pathname === item.href
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function isAdminNavGroupActive(
  pathname: string,
  item: AdminNavItem,
): boolean {
  if (isAdminNavActive(pathname, item)) return true
  return (item.children ?? []).some((child) =>
    isAdminNavActive(pathname, child),
  )
}
