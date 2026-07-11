export type ServiceStoreNavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

export const serviceStoreNavItems: ServiceStoreNavItem[] = [
  {
    href: "/service-store/dashboard",
    label: "Dashboard",
    match: (path) => path === "/service-store/dashboard",
  },
  {
    href: "/service-store/bookings",
    label: "Bookings",
    match: (path) => path.startsWith("/service-store/bookings"),
  },
  {
    href: "/service-store/branches",
    label: "Branches",
    match: (path) => path.startsWith("/service-store/branches"),
  },
  {
    href: "/service-store/customers",
    label: "CRM",
    match: (path) => path.startsWith("/service-store/customers"),
  },
  {
    href: "/service-store/billings",
    label: "Billing",
    match: (path) => path.startsWith("/service-store/billings"),
  },
  {
    href: "/service-store/members",
    label: "Members",
    match: (path) => path.startsWith("/service-store/members"),
  },
  {
    href: "/service-store/readiness",
    label: "Readiness",
    match: (path) => path.startsWith("/service-store/readiness"),
  },
  {
    href: "/service-store/profile",
    label: "Settings",
    match: (path) => path === "/service-store/profile",
  },
];

/** @deprecated Use serviceStoreNavItems */
export const serviceStoreNav = serviceStoreNavItems.map(({ href, label }) => ({ href, label }));
