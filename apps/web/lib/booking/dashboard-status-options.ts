import { getAllowedServiceStoreActions } from "@/lib/booking/engine/state-machine";
import { bookingStatusLabel } from "@/lib/booking/format";
import type { BookingStatus } from "@/lib/generated/prisma/client";

const DASHBOARD_HIDDEN_TRANSITIONS = new Set<BookingStatus>(["NO_SHOW", "CHECKED_IN"]);

export type DashboardBookingAction =
  | { type: "transition"; status: BookingStatus; label: string }
  | { type: "view"; label: string };

/** Valid dashboard actions for a booking row, aligned with the service-store status flow. */
export function getDashboardBookingActions(status: BookingStatus): DashboardBookingAction[] {
  const transitions = getAllowedServiceStoreActions(status)
    .filter((nextStatus) => !DASHBOARD_HIDDEN_TRANSITIONS.has(nextStatus))
    .map((nextStatus) => ({
      type: "transition" as const,
      status: nextStatus,
      label: bookingStatusLabel(nextStatus),
    }));

  if (transitions.length > 0) {
    return transitions;
  }

  return [{ type: "view", label: "View Details" }];
}
