"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import {
  updateMerchantProfile,
  type CatalogActionState,
} from "@/lib/merchant/catalog-actions";

type MerchantProfileFormProps = {
  defaultValues: {
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
  };
};

const initialState: CatalogActionState = {};

export function MerchantProfileForm({ defaultValues }: MerchantProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMerchantProfile,
    initialState,
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <FormField id="name" label="Business name" error={state.fieldErrors?.name?.[0]}>
        <input
          id="name"
          name="name"
          required
          className={inputClassName}
          defaultValue={defaultValues.name}
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        error={state.fieldErrors?.description?.[0]}
      >
        <textarea
          id="description"
          name="description"
          className={textareaClassName}
          defaultValue={defaultValues.description}
        />
      </FormField>

      <FormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
        <input
          id="phone"
          name="phone"
          className={inputClassName}
          defaultValue={defaultValues.phone}
        />
      </FormField>

      <FormField id="email" label="Email" error={state.fieldErrors?.email?.[0]}>
        <input
          id="email"
          name="email"
          type="email"
          className={inputClassName}
          defaultValue={defaultValues.email}
        />
      </FormField>

      <FormField id="website" label="Website" error={state.fieldErrors?.website?.[0]}>
        <input
          id="website"
          name="website"
          type="url"
          className={inputClassName}
          defaultValue={defaultValues.website}
        />
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
