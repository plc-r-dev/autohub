"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import { generateMonthlyBilling, type BillingActionState } from "@/lib/billing/actions";
import { FormField, inputClassName } from "@/components/onboarding/form-field";

const initialState: BillingActionState = {};

type AdminBillingGenerationFormProps = {
  defaultPeriodStart: string;
  defaultPeriodEnd: string;
  bookingFee: string;
  vatRate: string;
  currency: string;
};

export function AdminBillingGenerationForm({
  defaultPeriodStart,
  defaultPeriodEnd,
  bookingFee,
  vatRate,
  currency,
}: AdminBillingGenerationFormProps) {
  const [state, formAction, isPending] = useActionState(
    generateMonthlyBilling,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border p-4">
      <h2 className="font-medium">Generate monthly billing</h2>
      <p className="text-muted-foreground text-sm">
        Uses current platform settings: {bookingFee} {currency} per completed booking,{" "}
        {vatRate}% VAT. Values are snapshotted into each billing.
      </p>
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <FormField id="periodStart" label="Period start" error={state.fieldErrors?.periodStart?.[0]}>
        <input
          id="periodStart"
          name="periodStart"
          type="date"
          required
          defaultValue={defaultPeriodStart}
          className={inputClassName}
        />
      </FormField>
      <FormField id="periodEnd" label="Period end" error={state.fieldErrors?.periodEnd?.[0]}>
        <input
          id="periodEnd"
          name="periodEnd"
          type="date"
          required
          defaultValue={defaultPeriodEnd}
          className={inputClassName}
        />
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Generating..." : "Generate billings"}
      </Button>
    </form>
  );
}
