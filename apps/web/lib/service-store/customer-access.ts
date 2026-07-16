/**
 * Single source of truth for Customer-facing Service Store access.
 *
 * Customer Portal, LIFF, LINE Chat, QR, Search, Direct URL, and Booking API
 * must all use these helpers — never duplicate status / claim / readiness checks.
 */

import type { ServiceStoreStatus } from "@/lib/generated/prisma/client";
import { READINESS_STATUS, type ReadinessStatus } from "@/lib/service-store/domain/readiness";

export type CustomerStoreAccessReason =
  | "NOT_CLAIMED"
  | "SETTING_INCOMPLETE"
  | "NOT_ACTIVE"
  | "SUSPENDED"
  | "NOT_FOUND"
  | "OK";

export type CustomerStoreAccessResult = {
  accessible: boolean;
  reason: CustomerStoreAccessReason;
};

/**
 * Minimal store facts required for access decisions.
 * Callers load these once; this module stays pure (no Prisma).
 */
export type CustomerStoreAccessInput = {
  status: ServiceStoreStatus;
  bookingEnabled: boolean;
  hasApprovedClaim: boolean;
  hasPendingClaim: boolean;
  hasOwnerMember: boolean;
  readinessStatus: ReadinessStatus;
};

/** Statuses shown in Customer browse / search (bookable or not). */
const CUSTOMER_SEARCHABLE_STATUSES: ReadonlySet<ServiceStoreStatus> = new Set([
  "ACTIVE",
  "READY_FOR_BOOKING",
  "ONBOARDING",
]);

const ACCESS_MESSAGES: Record<CustomerStoreAccessReason, string | null> = {
  OK: null,
  NOT_FOUND: "This service shop is not available for booking.",
  NOT_CLAIMED: "This service shop has not joined AutoHub yet.",
  SETTING_INCOMPLETE:
    "This Service Store is completing setup and is not bookable yet.",
  NOT_ACTIVE: "This service shop is not available for booking.",
  SUSPENDED: "This service shop is not available for booking.",
};

function isClaimedOrOwned(store: CustomerStoreAccessInput): boolean {
  return store.hasApprovedClaim || store.hasOwnerMember;
}

function isBookableOperationalStatus(status: ServiceStoreStatus): boolean {
  return status === "ACTIVE" || status === "READY_FOR_BOOKING";
}

/**
 * Evaluate whether a customer may open booking for this store.
 * Pass `null` when the store row does not exist.
 */
export function getCustomerStoreAvailability(
  store: CustomerStoreAccessInput | null | undefined,
): CustomerStoreAccessResult {
  if (!store) {
    return { accessible: false, reason: "NOT_FOUND" };
  }

  if (store.status === "SUSPENDED") {
    return { accessible: false, reason: "SUSPENDED" };
  }

  if (
    store.status === "DRAFT" ||
    store.status === "PENDING_VERIFICATION"
  ) {
    return { accessible: false, reason: "NOT_ACTIVE" };
  }

  if (!isClaimedOrOwned(store)) {
    return { accessible: false, reason: "NOT_CLAIMED" };
  }

  const ready =
    store.bookingEnabled &&
    store.readinessStatus === READINESS_STATUS.READY &&
    isBookableOperationalStatus(store.status);

  if (!ready) {
    return { accessible: false, reason: "SETTING_INCOMPLETE" };
  }

  return { accessible: true, reason: "OK" };
}

/** Convenience boolean for booking gates / CTAs. */
export function canCustomerAccessStore(
  store: CustomerStoreAccessInput | null | undefined,
): boolean {
  return getCustomerStoreAvailability(store).accessible;
}

/** Whether the store appears in Customer browse / search results. */
export function isCustomerStoreSearchable(
  store: Pick<CustomerStoreAccessInput, "status"> | null | undefined,
): boolean {
  if (!store) return false;
  return CUSTOMER_SEARCHABLE_STATUSES.has(store.status);
}

/** Prisma `where.status` fragment for Customer discovery queries. */
export function customerStoreSearchableStatusFilter(): {
  in: Array<"ACTIVE" | "READY_FOR_BOOKING" | "ONBOARDING">;
} {
  return {
    in: ["ACTIVE", "READY_FOR_BOOKING", "ONBOARDING"],
  };
}

/** User-facing copy for inaccessible stores (Customer Portal + LIFF). */
export function getCustomerStoreAccessMessage(
  result: CustomerStoreAccessResult,
): string {
  return ACCESS_MESSAGES[result.reason] ?? ACCESS_MESSAGES.NOT_FOUND!;
}
