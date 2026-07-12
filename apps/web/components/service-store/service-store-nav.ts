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
    label: "Bookings",
    match: (path) => path.startsWith("/app/bookings"),
  },
  {
    href: "/app/branches",
    label: "Branches",
    match: (path) => path.startsWith("/app/branches"),
  },
  {
    href: "/app/customers",
    label: "CRM",
    match: (path) => path.startsWith("/app/customers"),
  },
  {
    href: "/app/billings",
    label: "Billing",
    match: (path) => path.startsWith("/app/billings"),
  },
  {
    href: "/app/members",
    label: "Members",
    match: (path) => path.startsWith("/app/members"),
  },
  {
    href: "/app/readiness",
    label: "Readiness",
    match: (path) => path.startsWith("/app/readiness"),
  },
  {
    href: "/app/profile",
    label: "Settings",
    match: (path) => path === "/app/profile",
  },
];

/** @deprecated Use serviceStoreNavItems */
export const serviceStoreNav = serviceStoreNavItems.map(({ href, label }) => ({ href, label }));
