export type AdminNavItem = {
  href: string
  label: string
  match?: "exact" | "prefix"
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", match: "prefix" },
  {
    href: "/admin/service-store-requests",
    label: "Store Requests",
    match: "prefix",
  },
  { href: "/admin/billings", label: "Billings", match: "prefix" },
  { href: "/admin/reports", label: "Reports", match: "prefix" },
  { href: "/admin/jobs", label: "Jobs", match: "prefix" },
  { href: "/admin/settings", label: "Settings", match: "prefix" },
]

export function isAdminNavActive(
  pathname: string,
  item: AdminNavItem,
): boolean {
  if (item.match === "exact") {
    return pathname === item.href
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
