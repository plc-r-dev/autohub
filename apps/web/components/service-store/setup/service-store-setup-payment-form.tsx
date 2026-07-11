"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
} from "@/components/service-store/ui";
import { savePaymentAccountStep, type SetupActionState } from "@/lib/service-store/setup-actions";

const initialState: SetupActionState = {};

export function ServiceStoreSetupPaymentForm({
  defaultValues,
}: {
  defaultValues: {
    payoutBankName: string;
    payoutAccountName: string;
    payoutAccountNumber: string;
    payoutBankBranch: string;
  };
}) {
  const [state, action, pending] = useActionState(savePaymentAccountStep, initialState);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border border-[#dce5ee] bg-white p-5">
      {state.fieldErrors?.payoutBankName?.[0] ? (
        <p className="text-sm text-red-600">{state.fieldErrors.payoutBankName[0]}</p>
      ) : null}
      <ServiceStoreFormField id="payoutBankName" label="Bank name" error={state.fieldErrors?.payoutBankName?.[0]}>
        <input
          id="payoutBankName"
          name="payoutBankName"
          required
          defaultValue={defaultValues.payoutBankName}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="payoutBankBranch" label="Branch (optional)" error={state.fieldErrors?.payoutBankBranch?.[0]}>
        <input
          id="payoutBankBranch"
          name="payoutBankBranch"
          defaultValue={defaultValues.payoutBankBranch}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="payoutAccountName" label="Account name" error={state.fieldErrors?.payoutAccountName?.[0]}>
        <input
          id="payoutAccountName"
          name="payoutAccountName"
          required
          defaultValue={defaultValues.payoutAccountName}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="payoutAccountNumber" label="Account number" error={state.fieldErrors?.payoutAccountNumber?.[0]}>
        <input
          id="payoutAccountNumber"
          name="payoutAccountNumber"
          required
          defaultValue={defaultValues.payoutAccountNumber}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save and continue"}
      </ServiceStoreButton>
    </form>
  );
}
