"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import { type BillingActionState, uploadBillingPaymentSlip } from "@/lib/billing/actions";

const initialState: BillingActionState = {};

type MerchantPaymentSlipFormProps = {
  billingId: string;
  canUpload: boolean;
};

export function MerchantPaymentSlipForm({
  billingId,
  canUpload,
}: MerchantPaymentSlipFormProps) {
  const [state, formAction, isPending] = useActionState(
    uploadBillingPaymentSlip.bind(null, billingId),
    initialState,
  );

  if (!canUpload) {
    return null;
  }

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <FormField
        id="paymentDate"
        label="Payment date"
        error={state.fieldErrors?.paymentDate?.[0]}
      >
        <input
          id="paymentDate"
          name="paymentDate"
          type="date"
          required
          className={inputClassName}
        />
      </FormField>

      <FormField id="amount" label="Amount" error={state.fieldErrors?.amount?.[0]}>
        <input
          id="amount"
          name="amount"
          type="number"
          min={1}
          required
          className={inputClassName}
        />
      </FormField>

      <FormField id="bank" label="Bank" error={state.fieldErrors?.bank?.[0]}>
        <input id="bank" name="bank" required className={inputClassName} />
      </FormField>

      <FormField
        id="referenceNumber"
        label="Reference number"
        error={state.fieldErrors?.referenceNumber?.[0]}
      >
        <input id="referenceNumber" name="referenceNumber" className={inputClassName} />
      </FormField>

      <FormField id="note" label="Note" error={state.fieldErrors?.note?.[0]}>
        <textarea id="note" name="note" className={textareaClassName} />
      </FormField>

      <FormField id="slipFile" label="Payment slip" error={state.fieldErrors?.slipFile?.[0]}>
        <input
          id="slipFile"
          name="slipFile"
          type="file"
          accept="image/*,application/pdf"
          required
          className={inputClassName}
        />
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload payment slip"}
      </Button>
    </form>
  );
}
