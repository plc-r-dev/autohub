/** Portal entry points — three independent experiences. */
export const PORTALS = {
  marketing: {
    home: "/",
    openInLine: "/open-in-line",
    // Sign In goes straight to LINE login — the intermediate portal-picker page was removed.
    signIn: "/app/login",
  },
  customer: {
    home: "/browse",
    liffEntry: "/browse",
    // Customers have no web login page — LINE OA / LIFF is the only entry point.
    openInLine: "/open-in-line",
  },
  serviceStore: {
    home: "/app",
    login: "/app/login",
    // Onboarding, pending-approval, and store-selection are all states of
    // the single bootstrap workspace at "/app" — not separate routes.
    onboarding: "/app",
    dashboard: "/app/dashboard",
    waiting: "/app",
    chooseStore: "/app",
  },
  admin: {
    home: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
  },
} as const;

export type PortalKey = keyof typeof PORTALS;
