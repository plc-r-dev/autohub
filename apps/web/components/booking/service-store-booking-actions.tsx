"use client";

import { useTransition } from "react";
import { ServiceStoreButton, ServiceStoreCard } from "@/components/service-store/ui";
import {
  cancelBookingAsServiceStore,
  completeBooking,
  confirmBooking,
  markBookingNoShow,
  startBooking,
} from "@/lib/booking/actions";

type ServiceStoreBookingActionsProps = {
  bookingNumber: string;
  status: string;
};

export function ServiceStoreBookingActions({
  bookingNumber,
  status,
}: ServiceStoreBookingActionsProps) {
  const [isPending, startTransition] = useTransition();

  function run(
    action: (
      number: string,
    ) => Promise<{ error?: string; success?: string }>,
  ) {
    startTransition(async () => {
      await action(bookingNumber);
    });
  }

  const hasActions =
    status === "PENDING" || status === "CONFIRMED" || status === "IN_PROGRESS";

  if (!hasActions) {
    return null;
  }

  return (
    <ServiceStoreCard>
      <h2 className="text-sm font-semibold text-[#15202b]">Actions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <>
            <ServiceStoreButton type="button" disabled={isPending} onClick={() => run(confirmBooking)}>
              {isPending ? "Working..." : "Confirm"}
            </ServiceStoreButton>
            <ServiceStoreButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => run(cancelBookingAsServiceStore)}
            >
              Cancel
            </ServiceStoreButton>
          </>
        ) : null}
        {status === "CONFIRMED" ? (
          <>
            <ServiceStoreButton type="button" disabled={isPending} onClick={() => run(startBooking)}>
              {isPending ? "Working..." : "Start"}
            </ServiceStoreButton>
            <ServiceStoreButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => run(markBookingNoShow)}
            >
              No-show
            </ServiceStoreButton>
            <ServiceStoreButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => run(cancelBookingAsServiceStore)}
            >
              Cancel
            </ServiceStoreButton>
          </>
        ) : null}
        {status === "IN_PROGRESS" ? (
          <ServiceStoreButton type="button" disabled={isPending} onClick={() => run(completeBooking)}>
            {isPending ? "Working..." : "Complete"}
          </ServiceStoreButton>
        ) : null}
      </div>
    </ServiceStoreCard>
  );
}
