"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { FormField, textareaClassName } from "@/components/onboarding/form-field";
import {
  approveBillingAsAdmin,
  type BillingActionState,
  rejectBillingAsAdmin,
} from "@/lib/billing/actions";

const initialState: BillingActionState = {};

type AdminBillingReviewActionsProps = {
  billingId: string;
  status: string;
};

export function AdminBillingReviewActions({
  billingId,
  status,
}: AdminBillingReviewActionsProps) {
  const [isApproving, startTransition] = useTransition();
  const [state, rejectAction, isRejecting] = useActionState(
    rejectBillingAsAdmin.bind(null, billingId),
    initialState,
  );

  if (status !== "SUBMITTED") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isApproving}
          onClick={() =>
            startTransition(async () => {
              await approveBillingAsAdmin(billingId);
            })
          }
        >
          {isApproving ? "Approving..." : "Approve billing"}
        </Button>
      </div>

      <form action={rejectAction} className="flex max-w-lg flex-col gap-2">
        <FormField id="reason" label="Reject reason" error={state.fieldErrors?.reason?.[0]}>
          <textarea id="reason" name="reason" required className={textareaClassName} />
        </FormField>
        <Button type="submit" variant="outline" disabled={isRejecting}>
          {isRejecting ? "Rejecting..." : "Reject billing"}
        </Button>
      </form>
    </div>
  );
}
