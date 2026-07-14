/** Portal entry points — three independent experiences. */
export const PORTALS = {
  marketing: {
    home: "/",
    openInLine: "/open-in-line",
    // Sign In is the marketing home — service-store LINE OAuth starts there.
    signIn: "/",
  },
  customer: {
    home: "/browse",
    liffEntry: "/browse",
    // Customer LINE OAuth entry (independent session cookie from Service Store).
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
