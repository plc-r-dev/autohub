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
    href: "/app/customers",
    label: "Customers",
    match: (path) => path.startsWith("/app/customers"),
  },
  {
    href: "/app/billings",
    label: "Billing",
    match: (path) => path.startsWith("/app/billings"),
  },
  {
    href: "/app/settings",
    label: "Store Settings",
    match: (path) =>
      path.startsWith("/app/settings") ||
      path.startsWith("/app/profile") ||
      path.startsWith("/app/members"),
  },
];

/** @deprecated Use serviceStoreNavItems */
export const serviceStoreNav = serviceStoreNavItems.map(({ href, label }) => ({ href, label }));
