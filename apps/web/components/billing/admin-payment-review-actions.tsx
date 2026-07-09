"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { FormField, textareaClassName } from "@/components/onboarding/form-field";
import {
  approveBillingPaymentAsAdmin,
  type BillingActionState,
  rejectBillingPaymentAsAdmin,
} from "@/lib/billing/actions";

const initialState: BillingActionState = {};

type AdminPaymentReviewActionsProps = {
  billingId: string;
  paymentId: string;
  reviewStatus: string;
  billingStatus: string;
};

export function AdminPaymentReviewActions({
  billingId,
  paymentId,
  reviewStatus,
  billingStatus,
}: AdminPaymentReviewActionsProps) {
  const [isApproving, startTransition] = useTransition();
  const [state, rejectAction, isRejecting] = useActionState(
    rejectBillingPaymentAsAdmin.bind(null, billingId, paymentId),
    initialState,
  );

  if (reviewStatus !== "PENDING" || billingStatus !== "PAYMENT_SUBMITTED") {
    return null;
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isApproving}
          onClick={() =>
            startTransition(async () => {
              await approveBillingPaymentAsAdmin(billingId, paymentId);
            })
          }
        >
          {isApproving ? "Approving..." : "Approve payment"}
        </Button>
      </div>

      <form action={rejectAction} className="flex max-w-lg flex-col gap-2">
        <FormField id="reason" label="Reject reason" error={state.fieldErrors?.reason?.[0]}>
          <textarea id="reason" name="reason" required className={textareaClassName} />
        </FormField>
        <Button type="submit" size="sm" variant="outline" disabled={isRejecting}>
          {isRejecting ? "Rejecting..." : "Reject payment"}
        </Button>
      </form>
    </div>
  );
}
