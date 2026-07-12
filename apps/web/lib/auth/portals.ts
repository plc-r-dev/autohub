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
    home: "/app",
    login: "/app/login",
    onboarding: "/app/onboarding",
    dashboard: "/app/dashboard",
    waiting: "/app/waiting",
  },
  admin: {
    home: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
  },
} as const;

export type PortalKey = keyof typeof PORTALS;
