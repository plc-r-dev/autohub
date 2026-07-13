import type { ServiceStoreStatus } from "@/lib/generated/prisma/client";

export const READINESS_STATUS = {
  READY: "READY",
  NOT_READY: "NOT_READY",
} as const;

export type ReadinessStatus = (typeof READINESS_STATUS)[keyof typeof READINESS_STATUS];

export type ReadinessCheckId =
  | "store_active"
  | "owner_assigned"
  | "branch_configured"
  | "service_configured"
  | "hours_configured"
  | "contact_configured"
  | "payment_configured";

export type ReadinessCheckItem = {
  id: ReadinessCheckId;
  label: string;
  description: string;
  met: boolean;
  actionHref?: string;
};

export type ServiceStoreReadiness = {
  status: ReadinessStatus;
  items: ReadinessCheckItem[];
  metCount: number;
  totalCount: number;
};

export type ReadinessInput = {
  status: ServiceStoreStatus;
  ownerCount: number;
  branchCount: number;
  activeServiceCount: number;
  branchesWithOpenHoursCount: number;
  hasContactInfo: boolean;
  hasPaymentAccount?: boolean;
  hasBusinessCategory?: boolean;
};

export function evaluateServiceStoreReadiness(input: ReadinessInput): ServiceStoreReadiness {
  const items: ReadinessCheckItem[] = [
    {
      id: "store_active",
      label: "Ready for booking",
      description: "Your Service Store has completed setup and is ready for online bookings.",
      met: input.status === "READY_FOR_BOOKING" || input.status === "ACTIVE",
    },
    {
      id: "owner_assigned",
      label: "Owner assigned",
      description: "At least one Owner is linked to this Service Store.",
      met: input.ownerCount > 0,
      actionHref: "/app/settings?tab=staff",
    },
    {
      id: "branch_configured",
      label: "Branch added",
      description: "Create at least one branch location.",
      met: input.branchCount > 0,
      actionHref: "/app/settings",
    },
    {
      id: "service_configured",
      label: "Active service",
      description: "Add at least one active service to a branch.",
      met: input.activeServiceCount > 0,
      actionHref: "/app/settings?tab=services",
    },
    {
      id: "hours_configured",
      label: "Operating hours",
      description: "Configure opening hours for customer bookings.",
      met: input.branchesWithOpenHoursCount > 0,
      actionHref: "/app/settings?tab=hours",
    },
    {
      id: "contact_configured",
      label: "Contact information",
      description: "Add a phone number or email to your Service Store profile.",
      met: input.hasContactInfo,
      actionHref: "/app/settings",
    },
    {
      id: "payment_configured",
      label: "Payment account",
      description: "Add a bank account for AutoHub payouts.",
      met: Boolean(input.hasPaymentAccount),
      actionHref: "/app/setup/payment",
    },
  ];

  const metCount = items.filter((item) => item.met).length;

  return {
    status: metCount === items.length ? READINESS_STATUS.READY : READINESS_STATUS.NOT_READY,
    items,
    metCount,
    totalCount: items.length,
  };
}

export function isServiceStoreReady(input: ReadinessInput): boolean {
  return evaluateServiceStoreReadiness(input).status === READINESS_STATUS.READY;
}
