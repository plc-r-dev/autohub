"use client";

import { useActionState } from "react";
import {
  Button,
  CustomerFormField,
  TextField,
} from "@/components/customer/ui";
import {
  createCustomerVehicle,
  type CustomerVehicleActionState,
} from "@/lib/customer/vehicle-actions";

type AddVehicleFormProps = {
  returnTo?: string;
  submitLabel?: string;
};

const initialState: CustomerVehicleActionState = {};

export function AddVehicleForm({
  returnTo,
  submitLabel = "Save vehicle",
}: AddVehicleFormProps) {
  const [state, formAction, isPending] = useActionState(createCustomerVehicle, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      {state.error ? (
        <p className="rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">{state.error}</p>
      ) : null}

      <CustomerFormField
        id="licensePlate"
        label="License plate"
        error={state.fieldErrors?.licensePlate?.[0]}
      >
        <TextField id="licensePlate" name="licensePlate" autoFocus required />
      </CustomerFormField>

      <CustomerFormField
        id="province"
        label="Province"
        error={state.fieldErrors?.province?.[0]}
      >
        <TextField id="province" name="province" />
      </CustomerFormField>

      <div className="grid grid-cols-2 gap-3">
        <CustomerFormField id="brand" label="Brand" error={state.fieldErrors?.brand?.[0]}>
          <TextField id="brand" name="brand" required />
        </CustomerFormField>
        <CustomerFormField id="model" label="Model" error={state.fieldErrors?.model?.[0]}>
          <TextField id="model" name="model" required />
        </CustomerFormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CustomerFormField id="year" label="Year" error={state.fieldErrors?.year?.[0]}>
          <TextField id="year" name="year" type="number" />
        </CustomerFormField>
        <CustomerFormField id="color" label="Color" error={state.fieldErrors?.color?.[0]}>
          <TextField id="color" name="color" />
        </CustomerFormField>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
