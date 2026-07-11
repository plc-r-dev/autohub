/**
 * LIFF deep-link route map.
 * Future: LINE Flex messages and Rich Menu items open these paths inside LIFF.
 */
export const LIFF_DEEP_LINKS = {
  home: "/browse",
  nearbyShops: "/browse?nearby=1",
  bookings: "/bookings",
  bookingDetail: (bookingNumber: string) => `/bookings/${bookingNumber}`,
  newBooking: (branchId: string, serviceId: string) =>
    `/bookings/new?branchId=${branchId}&serviceId=${serviceId}`,
  serviceStoreDetail: (serviceStoreId: string) => `/browse/${serviceStoreId}`,
  vehicles: "/vehicles",
  profile: "/profile",
} as const;

export type LiffDeepLinkKey = keyof typeof LIFF_DEEP_LINKS;

/** Builds an absolute LIFF entry URL (future: append LIFF ID). */
export function buildLiffEntryUrl(
  path: string,
  appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "",
): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
