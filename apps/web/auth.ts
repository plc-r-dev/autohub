import { createPortalAuth } from "@/lib/auth/create-portal-auth";

/** Customer portal (`/browse`, bookings, vehicles). Cookie prefix: `ah-customer`. */
export const customerAuth = createPortalAuth({
  cookiePrefix: "ah-customer",
  basePath: "/api/auth/customer",
});

/**
 * Service Store (+ Admin for now) portal (`/app`, `/admin`).
 * Cookie prefix: `ah-store` — independent from the customer session.
 */
export const serviceStoreAuth = createPortalAuth({
  cookiePrefix: "ah-store",
  basePath: "/api/auth/store",
});

/** @deprecated Prefer `serviceStoreAuth` or `customerAuth`. Alias for store portal. */
export const auth = serviceStoreAuth;

export type Session = typeof serviceStoreAuth.$Infer.Session;
export type CustomerSession = typeof customerAuth.$Infer.Session;
export type ServiceStoreSession = typeof serviceStoreAuth.$Infer.Session;
