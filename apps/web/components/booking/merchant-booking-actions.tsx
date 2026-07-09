"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  cancelBookingAsMerchant,
  completeBooking,
  confirmBooking,
  markBookingNoShow,
  startBooking,
} from "@/lib/booking/actions";

type MerchantBookingActionsProps = {
  bookingNumber: string;
  status: string;
};

export function MerchantBookingActions({
  bookingNumber,
  status,
}: MerchantBookingActionsProps) {
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

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" ? (
        <>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => run(confirmBooking)}
          >
            Confirm
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run(cancelBookingAsMerchant)}
          >
            Cancel
          </Button>
        </>
      ) : null}
      {status === "CONFIRMED" ? (
        <>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => run(startBooking)}
          >
            Start
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run(markBookingNoShow)}
          >
            No-show
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run(cancelBookingAsMerchant)}
          >
            Cancel
          </Button>
        </>
      ) : null}
      {status === "IN_PROGRESS" ? (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => run(completeBooking)}
        >
          Complete
        </Button>
      ) : null}
    </div>
  );
}
