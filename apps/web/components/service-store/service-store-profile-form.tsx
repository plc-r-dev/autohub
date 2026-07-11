"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import {
  updateServiceStoreProfile,
  type CatalogActionState,
} from "@/lib/service-store/catalog-actions";

type ServiceStoreProfileFormProps = {
  defaultValues: {
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
  };
};

const initialState: CatalogActionState = {};

export function ServiceStoreProfileForm({ defaultValues }: ServiceStoreProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateServiceStoreProfile, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

      <ServiceStoreFormField id="name" label="Business name" error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          required
          className={serviceStoreInputClassName}
          defaultValue={defaultValues.name}
        />
      </ServiceStoreFormField>

      <ServiceStoreFormField
        id="description"
        label="Description"
        error={state.fieldErrors?.description?.[0]}
      >
        <textarea
          id="description"
          name="description"
          className={serviceStoreTextareaClassName}
          defaultValue={defaultValues.description}
        />
      </ServiceStoreFormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <ServiceStoreFormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
          <input
            id="phone"
            name="phone"
            className={serviceStoreInputClassName}
            defaultValue={defaultValues.phone}
          />
        </ServiceStoreFormField>

        <ServiceStoreFormField id="email" label="Email" error={state.fieldErrors?.email?.[0]}>
          <input
            id="email"
            name="email"
            type="email"
            className={serviceStoreInputClassName}
            defaultValue={defaultValues.email}
          />
        </ServiceStoreFormField>
      </div>

      <ServiceStoreFormField id="website" label="Website" error={state.fieldErrors?.website?.[0]}>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          className={serviceStoreInputClassName}
          defaultValue={defaultValues.website}
        />
      </ServiceStoreFormField>

      <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Save settings"}
      </ServiceStoreButton>
    </form>
  );
}
