"use client";

import { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  approveServiceStoreClaim,
  approveServiceStoreOnboardingRequest,
  rejectServiceStoreClaim,
  rejectServiceStoreOnboardingRequest,
} from "@/lib/service-store/actions";

type ServiceStoreRequestActionsProps = {
  type: "claim" | "onboarding-request";
  requestId: string;
};

export function ServiceStoreRequestActions({
  type,
  requestId,
}: ServiceStoreRequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      if (type === "claim") {
        await approveServiceStoreClaim(requestId);
      } else {
        await approveServiceStoreOnboardingRequest(requestId);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      if (type === "claim") {
        await rejectServiceStoreClaim(requestId);
      } else {
        await rejectServiceStoreOnboardingRequest(requestId);
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
