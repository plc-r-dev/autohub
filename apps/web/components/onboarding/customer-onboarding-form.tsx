"use client";

import { useActionState } from "react";
import {
  Button,
  CustomerFormField,
  SelectField,
  TextField,
} from "@/components/customer/ui";
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
        <p className="rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-600">{state.error}</p>
      ) : null}

      {tenants.length === 0 ? (
        <p className="text-[14px] text-[#64748B]">
          No tenants are available yet. Contact an administrator before continuing.
        </p>
      ) : (
        <>
          <CustomerFormField
            id="tenantId"
            label="Tenant"
            error={state.fieldErrors?.tenantId?.[0]}
          >
            <SelectField id="tenantId" name="tenantId" required defaultValue="">
              <option value="" disabled>
                Select a tenant
              </option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.code})
                </option>
              ))}
            </SelectField>
          </CustomerFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <CustomerFormField
              id="firstName"
              label="First name"
              error={state.fieldErrors?.firstName?.[0]}
            >
              <TextField
                id="firstName"
                name="firstName"
                required
                defaultValue={defaultFirstName}
              />
            </CustomerFormField>

            <CustomerFormField
              id="lastName"
              label="Last name"
              error={state.fieldErrors?.lastName?.[0]}
            >
              <TextField
                id="lastName"
                name="lastName"
                required
                defaultValue={defaultLastName}
              />
            </CustomerFormField>
          </div>

          <CustomerFormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
            <TextField id="phone" name="phone" />
          </CustomerFormField>

          <CustomerFormField id="email" label="Email" error={state.fieldErrors?.email?.[0]}>
            <TextField
              id="email"
              name="email"
              type="email"
              defaultValue={defaultEmail}
            />
          </CustomerFormField>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating profile…" : "Complete onboarding"}
          </Button>
        </>
      )}
    </form>
  );
}
