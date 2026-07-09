"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/onboarding/form-field";
import {
  completeCustomerOnboarding,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";

type TenantOption = {
  id: string;
  code: string;
  name: string;
};

type CustomerOnboardingFormProps = {
  tenants: TenantOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
};

const initialState: OnboardingActionState = {};

export function CustomerOnboardingForm({
  tenants,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
}: CustomerOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeCustomerOnboarding,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      {tenants.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tenants are available yet. Contact an administrator before
          continuing.
        </p>
      ) : (
        <>
          <FormField
            id="tenantId"
            label="Tenant"
            error={state.fieldErrors?.tenantId?.[0]}
          >
            <select
              id="tenantId"
              name="tenantId"
              required
              className={selectClassName}
              defaultValue=""
            >
              <option value="" disabled>
                Select a tenant
              </option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.code})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="firstName"
              label="First name"
              error={state.fieldErrors?.firstName?.[0]}
            >
              <input
                id="firstName"
                name="firstName"
                required
                className={inputClassName}
                defaultValue={defaultFirstName}
              />
            </FormField>

            <FormField
              id="lastName"
              label="Last name"
              error={state.fieldErrors?.lastName?.[0]}
            >
              <input
                id="lastName"
                name="lastName"
                required
                className={inputClassName}
                defaultValue={defaultLastName}
              />
            </FormField>
          </div>

          <FormField
            id="phone"
            label="Phone"
            error={state.fieldErrors?.phone?.[0]}
          >
            <input id="phone" name="phone" className={inputClassName} />
          </FormField>

          <FormField
            id="email"
            label="Email"
            error={state.fieldErrors?.email?.[0]}
          >
            <input
              id="email"
              name="email"
              type="email"
              className={inputClassName}
              defaultValue={defaultEmail}
            />
          </FormField>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating profile..." : "Complete onboarding"}
          </Button>
        </>
      )}
    </form>
  );
}
