"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  approveMerchantClaim,
  approveMerchantOnboardingRequest,
  rejectMerchantClaim,
  rejectMerchantOnboardingRequest,
} from "@/lib/merchant/actions";

type MerchantRequestActionsProps = {
  type: "claim" | "onboarding-request";
  requestId: string;
};

export function MerchantRequestActions({
  type,
  requestId,
}: MerchantRequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      if (type === "claim") {
        await approveMerchantClaim(requestId);
      } else {
        await approveMerchantOnboardingRequest(requestId);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      if (type === "claim") {
        await rejectMerchantClaim(requestId);
      } else {
        await rejectMerchantOnboardingRequest(requestId);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={handleApprove}
      >
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleReject}
      >
        Reject
      </Button>
    </div>
  );
}
