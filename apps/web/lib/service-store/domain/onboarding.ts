import type { ServiceStoreStatus } from "@/lib/generated/prisma/client";

export const ONBOARDING_SETUP_STEP = {
  SERVICES: "services",
  HOURS: "hours",
  PAYMENT: "payment",
  TEAM: "team",
} as const;

export type OnboardingSetupStep =
  (typeof ONBOARDING_SETUP_STEP)[keyof typeof ONBOARDING_SETUP_STEP];

export const ONBOARDING_SETUP_STEPS: OnboardingSetupStep[] = [
  ONBOARDING_SETUP_STEP.SERVICES,
  ONBOARDING_SETUP_STEP.HOURS,
  ONBOARDING_SETUP_STEP.PAYMENT,
  ONBOARDING_SETUP_STEP.TEAM,
];

export const REQUIRED_SETUP_STEPS: OnboardingSetupStep[] = [
  ONBOARDING_SETUP_STEP.SERVICES,
  ONBOARDING_SETUP_STEP.HOURS,
  ONBOARDING_SETUP_STEP.PAYMENT,
];

export type OnboardingSetupInput = {
  status: ServiceStoreStatus;
  name: string;
  phone: string | null;
  email: string | null;
  businessCategory: string | null;
  googlePlaceId: string | null;
  payoutBankName: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
  branchCount: number;
  activeServiceCount: number;
  branchesWithOpenHoursCount: number;
  teamInvited: boolean;
};

export type OnboardingSetupStepState = {
  id: OnboardingSetupStep;
  label: string;
  description: string;
  required: boolean;
  met: boolean;
  href: string;
};

export type OnboardingSetupProgress = {
  steps: OnboardingSetupStepState[];
  requiredMetCount: number;
  requiredTotalCount: number;
  isComplete: boolean;
  nextStep: OnboardingSetupStep | null;
};

export function setupStepLabel(step: OnboardingSetupStep): string {
  const labels: Record<OnboardingSetupStep, string> = {
    services: "Configure services",
    hours: "Configure operating hours",
    payment: "Configure payment account",
    team: "Invite team members",
  };
  return labels[step];
}

export function evaluateOnboardingSetup(input: OnboardingSetupInput): OnboardingSetupProgress {
  const hasServices = input.activeServiceCount > 0;
  const hasHours = input.branchesWithOpenHoursCount > 0;
  const hasPayment = Boolean(
    input.payoutBankName?.trim() &&
      input.payoutAccountName?.trim() &&
      input.payoutAccountNumber?.trim(),
  );

  const steps: OnboardingSetupStepState[] = [
    {
      id: ONBOARDING_SETUP_STEP.SERVICES,
      label: setupStepLabel(ONBOARDING_SETUP_STEP.SERVICES),
      description: "Add at least one active service customers can book.",
      required: true,
      met: hasServices,
      href: "/app/setup/services",
    },
    {
      id: ONBOARDING_SETUP_STEP.HOURS,
      label: setupStepLabel(ONBOARDING_SETUP_STEP.HOURS),
      description: "Set opening hours for your branch.",
      required: true,
      met: hasHours,
      href: "/app/setup/hours",
    },
    {
      id: ONBOARDING_SETUP_STEP.PAYMENT,
      label: setupStepLabel(ONBOARDING_SETUP_STEP.PAYMENT),
      description: "Add the bank account for AutoHub payouts.",
      required: true,
      met: hasPayment,
      href: "/app/setup/payment",
    },
    {
      id: ONBOARDING_SETUP_STEP.TEAM,
      label: setupStepLabel(ONBOARDING_SETUP_STEP.TEAM),
      description: "Optional — invite managers, staff, or finance users.",
      required: false,
      met: input.teamInvited,
      href: "/app/setup/team",
    },
  ];

  const requiredSteps = steps.filter((step) => step.required);
  const requiredMetCount = requiredSteps.filter((step) => step.met).length;
  const isComplete = requiredMetCount === requiredSteps.length;
  const nextStep = steps.find((step) => step.required && !step.met)?.id ?? null;

  return {
    steps,
    requiredMetCount,
    requiredTotalCount: requiredSteps.length,
    isComplete,
    nextStep,
  };
}

export function canTransitionToReadyForBooking(input: OnboardingSetupInput): boolean {
  return evaluateOnboardingSetup(input).isComplete;
}

export function isServiceStoreInSetup(status: ServiceStoreStatus): boolean {
  return status === "ONBOARDING";
}

export function isServiceStoreReadyForBooking(status: ServiceStoreStatus): boolean {
  return status === "READY_FOR_BOOKING";
}

export function isServiceStoreBookableStatus(status: ServiceStoreStatus): boolean {
  return status === "READY_FOR_BOOKING" || status === "ACTIVE";
}
