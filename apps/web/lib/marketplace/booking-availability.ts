export const MarketplaceBookingStatus = {
  BOOKABLE: "BOOKABLE",
  DISCOVERED: "DISCOVERED",
  CLAIM_PENDING: "CLAIM_PENDING",
  SETUP_INCOMPLETE: "SETUP_INCOMPLETE",
} as const;

export type MarketplaceBookingStatus =
  (typeof MarketplaceBookingStatus)[keyof typeof MarketplaceBookingStatus];

export type MarketplaceMerchantFacts = {
  status: "DRAFT" | "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
  hasApprovedClaim: boolean;
  hasPendingClaim: boolean;
  activeBranchCount: number;
  activeServiceCount: number;
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
    unavailableMessage: "This service shop has not joined AutoHub yet.",
  },
};

// TODO(Marketplace Phase 2): Restore Merchant.bookingEnabled in bookability checks
// once discovered-only listings return to the customer browse experience.
export function resolveMarketplaceBookingStatus(
  facts: MarketplaceMerchantFacts,
): MarketplaceBookingStatus {
  const hasCatalog =
    facts.activeBranchCount > 0 && facts.activeServiceCount > 0;

  const bookable =
    facts.hasApprovedClaim && facts.status === "ACTIVE" && hasCatalog;

  if (bookable) {
    return MarketplaceBookingStatus.BOOKABLE;
  }

  if (facts.hasPendingClaim && !facts.hasApprovedClaim) {
    return MarketplaceBookingStatus.CLAIM_PENDING;
  }

  if (facts.hasApprovedClaim && facts.status === "ACTIVE" && !hasCatalog) {
    return MarketplaceBookingStatus.SETUP_INCOMPLETE;
  }

  return MarketplaceBookingStatus.DISCOVERED;
}

export function toMarketplaceBookingPresentation(
  facts: MarketplaceMerchantFacts,
): MarketplaceBookingPresentation {
  const status = resolveMarketplaceBookingStatus(facts);
  return {
    bookable: status === MarketplaceBookingStatus.BOOKABLE,
    status,
    ...PRESENTATION[status],
  };
}

export function isMerchantBookable(facts: MarketplaceMerchantFacts): boolean {
  return resolveMarketplaceBookingStatus(facts) === MarketplaceBookingStatus.BOOKABLE;
}
