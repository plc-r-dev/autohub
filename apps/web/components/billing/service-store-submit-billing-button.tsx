"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { submitBillingAsServiceStore } from "@/lib/billing/actions";

type ServiceStoreSubmitBillingButtonProps = {
  billingId: string;
  status: string;
};

export function ServiceStoreSubmitBillingButton({
  billingId,
  status,
}: ServiceStoreSubmitBillingButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (status !== "DRAFT") {
    return null;
  }

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await submitBillingAsServiceStore(billingId);
        })
      }
    >
      {isPending ? "Submitting..." : "Submit billing"}
    </Button>
  );
}
