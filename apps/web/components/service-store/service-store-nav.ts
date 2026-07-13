export type ServiceStoreNavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

export const serviceStoreNavItems: ServiceStoreNavItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    match: (path) => path === "/app/dashboard",
  },
  {
    href: "/app/bookings",
    label: "Booking",
    match: (path) => path.startsWith("/app/bookings"),
  },
  {
    href: "/app/customers",
    label: "Customer",
    match: (path) => path.startsWith("/app/customers"),
  },
  {
    href: "/app/settings",
    label: "Settings",
    match: (path) => path.startsWith("/app/settings") || path.startsWith("/app/profile"),
  },
  {
    href: "/app/members",
    label: "Staff",
    match: (path) => path.startsWith("/app/members"),
  },
  {
    href: "/app/billings",
    label: "Billing",
    match: (path) => path.startsWith("/app/billings"),
  },
];

/** @deprecated Use serviceStoreNavItems */
export const serviceStoreNav = serviceStoreNavItems.map(({ href, label }) => ({ href, label }));
