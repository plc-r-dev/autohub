"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import {
  createBranch,
  updateBranch,
  type CatalogActionState,
} from "@/lib/merchant/catalog-actions";

type BranchFormProps = {
  mode: "create" | "edit";
  branchId?: string;
  defaultValues?: {
    code: string;
    name: string;
    phone: string;
    address: string;
    slotIntervalMinutes: number;
    concurrentCapacity: number;
  };
};

const initialState: CatalogActionState = {};

export function BranchForm({ mode, branchId, defaultValues }: BranchFormProps) {
  const action =
    mode === "create"
      ? createBranch
      : updateBranch.bind(null, branchId!);

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <FormField id="code" label="Code" error={state.fieldErrors?.code?.[0]}>
        <input
          id="code"
          name="code"
          required
          placeholder="main-branch"
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

      <FormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
        <input
          id="phone"
          name="phone"
          className={inputClassName}
          defaultValue={defaultValues?.phone}
        />
      </FormField>

      <FormField id="address" label="Address" error={state.fieldErrors?.address?.[0]}>
        <textarea
          id="address"
          name="address"
          className={textareaClassName}
          defaultValue={defaultValues?.address}
        />
      </FormField>

      <FormField
        id="slotIntervalMinutes"
        label="Slot interval (minutes)"
        error={state.fieldErrors?.slotIntervalMinutes?.[0]}
      >
        <input
          id="slotIntervalMinutes"
          name="slotIntervalMinutes"
          type="number"
          min={5}
          max={120}
          required
          className={inputClassName}
          defaultValue={defaultValues?.slotIntervalMinutes ?? 15}
        />
      </FormField>

      <FormField
        id="concurrentCapacity"
        label="Concurrent capacity"
        error={state.fieldErrors?.concurrentCapacity?.[0]}
      >
        <input
          id="concurrentCapacity"
          name="concurrentCapacity"
          type="number"
          min={1}
          max={50}
          required
          className={inputClassName}
          defaultValue={defaultValues?.concurrentCapacity ?? 1}
        />
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Create branch" : "Save branch"}
      </Button>
    </form>
  );
}
