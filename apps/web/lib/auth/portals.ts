/** Portal entry points — three independent experiences. */
export const PORTALS = {
  marketing: {
    home: "/",
    openInLine: "/open-in-line",
    loginFallback: "/login",
    signIn: "/sign-in",
  },
  customer: {
    home: "/browse",
    liffEntry: "/browse",
    loginFallback: "/login",
    openInLine: "/open-in-line",
  },
  serviceStore: {
    home: "/service-store",
    login: "/service-store/login",
    onboarding: "/service-store/onboarding",
    dashboard: "/service-store/dashboard",
    waiting: "/service-store/waiting",
  },
  admin: {
    home: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
  },
} as const;

export type PortalKey = keyof typeof PORTALS;
