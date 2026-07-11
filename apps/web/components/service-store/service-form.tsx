"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
} from "@/components/service-store/ui";
import {
  createService,
  updateService,
  type CatalogActionState,
} from "@/lib/service-store/catalog-actions";

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

export function ServiceForm({ mode, branchId, serviceId, defaultValues }: ServiceFormProps) {
  const action =
    mode === "create"
      ? createService.bind(null, branchId)
      : updateService.bind(null, branchId, serviceId!);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

      <ServiceStoreFormField id="code" label="Service code" error={state.fieldErrors?.code?.[0]}>
        <input
          id="code"
          name="code"
          required
          placeholder="premium-wash"
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.code}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField id="name" label="Service name" error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          required
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.name}
        />
      </ServiceStoreFormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <ServiceStoreFormField
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
            className={serviceStoreInputClassName}
            defaultValue={defaultValues?.duration ?? 60}
          />
        </ServiceStoreFormField>

        <ServiceStoreFormField
          id="bufferMinutes"
          label="Buffer (minutes)"
          error={state.fieldErrors?.bufferMinutes?.[0]}
        >
          <input
            id="bufferMinutes"
            name="bufferMinutes"
            type="number"
            min={0}
            required
            className={serviceStoreInputClassName}
            defaultValue={defaultValues?.bufferMinutes ?? 0}
          />
        </ServiceStoreFormField>
      </div>

      <ServiceStoreFormField id="price" label="Price (THB)" error={state.fieldErrors?.price?.[0]}>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          required
          className={serviceStoreInputClassName}
          defaultValue={defaultValues?.price}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField id="isActive" label="Status" error={state.fieldErrors?.isActive?.[0]}>
        <select
          id="isActive"
          name="isActive"
          className={serviceStoreSelectClassName}
          defaultValue={defaultValues?.isActive === false ? "false" : "true"}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </ServiceStoreFormField>

      <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : mode === "create" ? "Create service" : "Save service"}
      </ServiceStoreButton>
    </form>
  );
}
