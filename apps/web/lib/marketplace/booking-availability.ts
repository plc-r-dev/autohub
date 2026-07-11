import { READINESS_STATUS } from "@/lib/service-store/domain";

export const MarketplaceBookingStatus = {
  BOOKABLE: "BOOKABLE",
  DISCOVERED: "DISCOVERED",
  CLAIM_PENDING: "CLAIM_PENDING",
  SETUP_INCOMPLETE: "SETUP_INCOMPLETE",
} as const;

export type MarketplaceBookingStatus =
  (typeof MarketplaceBookingStatus)[keyof typeof MarketplaceBookingStatus];

export type MarketplaceServiceStoreFacts = {
  status: "DRAFT" | "PENDING_VERIFICATION" | "ONBOARDING" | "ACTIVE" | "READY_FOR_BOOKING" | "SUSPENDED";
  hasApprovedClaim: boolean;
  hasPendingClaim: boolean;
  hasOwnerMember: boolean;
  activeBranchCount: number;
  activeServiceCount: number;
  readinessStatus: "READY" | "NOT_READY";
};

export type MarketplaceBookingPresentation = {
  bookable: boolean;
  status: MarketplaceBookingStatus;
  statusLabel: string;
  partnerBadge: string | null;
  ctaLabel: string;
  ctaAction: "book" | "details";
  unavailableMessage: string | null;
};

const PRESENTATION: Record<
  MarketplaceBookingStatus,
  Omit<MarketplaceBookingPresentation, "bookable" | "status">
> = {
  BOOKABLE: {
    statusLabel: "AutoHub Partner",
    partnerBadge: "AutoHub Partner",
    ctaLabel: "Book Now",
    ctaAction: "book",
    unavailableMessage: null,
  },
  DISCOVERED: {
    statusLabel: "Not available for online booking",
    partnerBadge: null,
    ctaLabel: "View Details",
    ctaAction: "details",
    unavailableMessage: "This service shop has not joined AutoHub yet.",
  },
  CLAIM_PENDING: {
    statusLabel: "Joining AutoHub",
    partnerBadge: null,
    ctaLabel: "View Details",
    ctaAction: "details",
    unavailableMessage: "This service shop has not joined AutoHub yet.",
  },
  SETUP_INCOMPLETE: {
    statusLabel: "Coming Soon",
    partnerBadge: null,
    ctaLabel: "View Details",
    ctaAction: "details",
    unavailableMessage: "This Service Store is completing setup and is not bookable yet.",
  },
};

export function resolveMarketplaceBookingStatus(
  facts: MarketplaceServiceStoreFacts,
): MarketplaceBookingStatus {
  if (facts.readinessStatus === READINESS_STATUS.READY) {
    return MarketplaceBookingStatus.BOOKABLE;
  }

  if (facts.hasPendingClaim && !facts.hasApprovedClaim && !facts.hasOwnerMember) {
    return MarketplaceBookingStatus.CLAIM_PENDING;
  }

  if (facts.hasApprovedClaim || facts.hasOwnerMember) {
    return MarketplaceBookingStatus.SETUP_INCOMPLETE;
  }

  return MarketplaceBookingStatus.DISCOVERED;
}

export function toMarketplaceBookingPresentation(
  facts: MarketplaceServiceStoreFacts,
): MarketplaceBookingPresentation {
  const status = resolveMarketplaceBookingStatus(facts);
  return {
    bookable: status === MarketplaceBookingStatus.BOOKABLE,
    status,
    ...PRESENTATION[status],
  };
}

export function isServiceStoreBookable(facts: MarketplaceServiceStoreFacts): boolean {
  return (
    facts.readinessStatus === READINESS_STATUS.READY &&
    (facts.status === "READY_FOR_BOOKING" || facts.status === "ACTIVE")
  );
}
