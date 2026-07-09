"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/onboarding/form-field";
import {
  createService,
  updateService,
  type CatalogActionState,
} from "@/lib/merchant/catalog-actions";

type ServiceFormProps = {
  mode: "create" | "edit";
  branchId: string;
  serviceId?: string;
  defaultValues?: {
    code: string;
    name: string;
    duration: number;
    bufferMinutes: number;
    price: string;
    isActive: boolean;
  };
};

const initialState: CatalogActionState = {};

export function ServiceForm({
  mode,
  branchId,
  serviceId,
  defaultValues,
}: ServiceFormProps) {
  const action =
    mode === "create"
      ? createService.bind(null, branchId)
      : updateService.bind(null, branchId, serviceId!);

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <FormField id="code" label="Code" error={state.fieldErrors?.code?.[0]}>
        <input
          id="code"
          name="code"
          required
          placeholder="oil-change"
          className={inputClassName}
          defaultValue={defaultValues?.code}
        />
      </FormField>

      <FormField id="name" label="Name" error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          required
          className={inputClassName}
          defaultValue={defaultValues?.name}
        />
      </FormField>

      <FormField
        id="duration"
        label="Duration (minutes)"
        error={state.fieldErrors?.duration?.[0]}
      >
        <input
          id="duration"
          name="duration"
          type="number"
          min={5}
          required
          className={inputClassName}
          defaultValue={defaultValues?.duration ?? 60}
        />
      </FormField>

      <FormField
        id="bufferMinutes"
        label="Buffer time (minutes)"
        error={state.fieldErrors?.bufferMinutes?.[0]}
      >
        <input
          id="bufferMinutes"
          name="bufferMinutes"
          type="number"
          min={0}
          required
          className={inputClassName}
          defaultValue={defaultValues?.bufferMinutes ?? 0}
        />
      </FormField>

      <FormField id="price" label="Price" error={state.fieldErrors?.price?.[0]}>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          required
          className={inputClassName}
          defaultValue={defaultValues?.price}
        />
      </FormField>

      <FormField id="isActive" label="Status" error={state.fieldErrors?.isActive?.[0]}>
        <select
          id="isActive"
          name="isActive"
          className={selectClassName}
          defaultValue={defaultValues?.isActive === false ? "false" : "true"}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Create service" : "Save service"}
      </Button>
    </form>
  );
}
