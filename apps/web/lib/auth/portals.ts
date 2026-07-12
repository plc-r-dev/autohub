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
    onboarding: "/app/onboarding",
    dashboard: "/app/dashboard",
    waiting: "/pending-approval",
    chooseStore: "/choose-store",
  },
  admin: {
    home: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
  },
} as const;

export type PortalKey = keyof typeof PORTALS;
