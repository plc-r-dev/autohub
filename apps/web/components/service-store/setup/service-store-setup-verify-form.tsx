"use client";

import { useActionState } from "react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import { saveVerifyBusinessStep, type SetupActionState } from "@/lib/service-store/setup-actions";
import { SERVICE_STORE_BUSINESS_CATEGORIES } from "@/lib/service-store/domain";

const initialState: SetupActionState = {};

export function ServiceStoreSetupVerifyForm({
  defaultValues,
}: {
  defaultValues: {
    name: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    businessCategory: string;
    address: string;
    latitude: number | "";
    longitude: number | "";
  };
}) {
  const [state, action, pending] = useActionState(saveVerifyBusinessStep, initialState);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border border-[#dce5ee] bg-white p-5">
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#16A34A]">{state.success}</p> : null}

      <ServiceStoreFormField id="name" label="Store name" error={state.fieldErrors?.name?.[0]}>
        <input id="name" name="name" required defaultValue={defaultValues.name} className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="businessCategory" label="Business category" error={state.fieldErrors?.businessCategory?.[0]}>
        <select
          id="businessCategory"
          name="businessCategory"
          required
          defaultValue={defaultValues.businessCategory}
          className={serviceStoreSelectClassName}
        >
          <option value="" disabled>
            Select a category
          </option>
          {SERVICE_STORE_BUSINESS_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </ServiceStoreFormField>
      <ServiceStoreFormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
        <input id="phone" name="phone" required defaultValue={defaultValues.phone} className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="email" label="Email" error={state.fieldErrors?.email?.[0]}>
        <input id="email" name="email" type="email" defaultValue={defaultValues.email} className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="website" label="Website" error={state.fieldErrors?.website?.[0]}>
        <input id="website" name="website" type="url" defaultValue={defaultValues.website} className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="address" label="Address" error={state.fieldErrors?.address?.[0]}>
        <input id="address" name="address" required defaultValue={defaultValues.address} className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField id="latitude" label="Latitude" error={state.fieldErrors?.latitude?.[0]}>
          <input id="latitude" name="latitude" required defaultValue={defaultValues.latitude} className={serviceStoreInputClassName} />
        </ServiceStoreFormField>
        <ServiceStoreFormField id="longitude" label="Longitude" error={state.fieldErrors?.longitude?.[0]}>
          <input id="longitude" name="longitude" required defaultValue={defaultValues.longitude} className={serviceStoreInputClassName} />
        </ServiceStoreFormField>
      </div>
      <ServiceStoreFormField id="description" label="Description" error={state.fieldErrors?.description?.[0]}>
        <textarea id="description" name="description" defaultValue={defaultValues.description} className={serviceStoreTextareaClassName} />
      </ServiceStoreFormField>
      <ServiceStoreButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save and continue"}
      </ServiceStoreButton>
    </form>
  );
}
