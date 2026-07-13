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
  // {
  //   href: "/app/branches",
  //   label: "Branches",
  //   match: (path) => path.startsWith("/app/branches"),
  // },
  {
    href: "/app/customers",
    label: "Customer",
    match: (path) => path.startsWith("/app/customers"),
  },
  {
    href: "/app/billings",
    label: "Billing",
    match: (path) => path.startsWith("/app/billings"),
  },
];

/** @deprecated Use serviceStoreNavItems */
export const serviceStoreNav = serviceStoreNavItems.map(({ href, label }) => ({ href, label }));
