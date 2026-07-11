"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import {
  createBranch,
  updateBranch,
  type CatalogActionState,
} from "@/lib/service-store/catalog-actions";

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
  const action = mode === "create" ? createBranch : updateBranch.bind(null, branchId!);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

      <ServiceStoreFormField id="code" label="Branch code" error={state.fieldErrors?.code?.[0]}>
        <input
          id="code"
          name="code"
          required
          placeholder="main-branch"
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.code}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField id="name" label="Branch name" error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          required
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.name}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
        <input
          id="phone"
          name="phone"
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.phone}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField id="address" label="Address" error={state.fieldErrors?.address?.[0]}>
        <textarea
          id="address"
          name="address"
          className={serviceStoreTextareaClassName}
          defaultValue={defaultValues?.address}
        />
      </ServiceStoreFormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <ServiceStoreFormField
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
            className={serviceStoreInputClassName}
            defaultValue={defaultValues?.slotIntervalMinutes ?? 15}
          />
        </ServiceStoreFormField>

        <ServiceStoreFormField
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
            className={serviceStoreInputClassName}
            defaultValue={defaultValues?.concurrentCapacity ?? 1}
          />
        </ServiceStoreFormField>
      </div>

      <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : mode === "create" ? "Create branch" : "Save branch"}
      </ServiceStoreButton>
    </form>
  );
}
