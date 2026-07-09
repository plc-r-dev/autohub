"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { submitBillingAsMerchant } from "@/lib/billing/actions";

type MerchantSubmitBillingButtonProps = {
  billingId: string;
  status: string;
};

export function MerchantSubmitBillingButton({
  billingId,
  status,
}: MerchantSubmitBillingButtonProps) {
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
          await submitBillingAsMerchant(billingId);
        })
      }
    >
      {isPending ? "Submitting..." : "Submit billing"}
    </Button>
  );
}
