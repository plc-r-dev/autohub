export const BOOKING_WIZARD_STEP = {
  SERVICE: "service",
  BRANCH: "branch",
  VEHICLE: "vehicle",
  DATE: "date",
  TIME: "time",
  REVIEW: "review",
} as const;

export type BookingWizardStep = (typeof BOOKING_WIZARD_STEP)[keyof typeof BOOKING_WIZARD_STEP];

export const BOOKING_WIZARD_STEPS: BookingWizardStep[] = [
  BOOKING_WIZARD_STEP.SERVICE,
  BOOKING_WIZARD_STEP.BRANCH,
  BOOKING_WIZARD_STEP.VEHICLE,
  BOOKING_WIZARD_STEP.DATE,
  BOOKING_WIZARD_STEP.TIME,
  BOOKING_WIZARD_STEP.REVIEW,
];

export function wizardStepLabel(step: BookingWizardStep): string {
  const labels: Record<BookingWizardStep, string> = {
    service: "Service",
    branch: "Branch",
    vehicle: "Vehicle",
    date: "Date",
    time: "Time",
    review: "Review",
  };
  return labels[step];
}

export function buildBookingWizardHref(input: {
  serviceStoreId: string;
  serviceId?: string;
  branchId?: string;
  vehicleId?: string;
  step?: BookingWizardStep;
}) {
  const params = new URLSearchParams({ serviceStoreId: input.serviceStoreId });
  if (input.serviceId) params.set("serviceId", input.serviceId);
  if (input.branchId) params.set("branchId", input.branchId);
  if (input.vehicleId) params.set("vehicleId", input.vehicleId);
  if (input.step) params.set("step", input.step);
  return `/bookings/new?${params.toString()}`;
}

export function resolveBookingWizardStep(input: {
  requestedStep?: string | null;
  serviceId?: string | null;
  branchId?: string | null;
  branchesForService: number;
}): BookingWizardStep {
  const requested = input.requestedStep as BookingWizardStep | undefined;
  if (requested && BOOKING_WIZARD_STEPS.includes(requested)) {
    return requested;
  }
  if (!input.serviceId) {
    return BOOKING_WIZARD_STEP.SERVICE;
  }
  if (!input.branchId && input.branchesForService > 1) {
    return BOOKING_WIZARD_STEP.BRANCH;
  }
  return BOOKING_WIZARD_STEP.VEHICLE;
}
