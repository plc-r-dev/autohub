"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import {
  completeServiceStoreOnboarding,
  searchServiceStoresAction,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";

type TenantOption = {
  id: string;
  code: string;
  name: string;
};

type ServiceStoreResult = {
  id: string;
  name: string;
  code: string;
  status: string;
  phone: string | null;
  email: string | null;
};

type ServiceStoreOnboardingFormProps = {
  tenants: TenantOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultMode?: "claim" | "request";
};

const initialState: OnboardingActionState = {};

export function ServiceStoreOnboardingForm({
  tenants,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultMode = "claim",
}: ServiceStoreOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeServiceStoreOnboarding,
    initialState,
  );
  const [mode, setMode] = useState<"claim" | "request">(defaultMode);
  const [tenantId, setTenantId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ServiceStoreResult[]>([]);
  const [selectedServiceStoreId, setSelectedServiceStoreId] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (mode !== "claim" || !tenantId || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const results = await searchServiceStoresAction(tenantId, value);
        setSearchResults(results);
      });
    }, 300);
  }

  function handleTenantChange(value: string) {
    setTenantId(value);
    setSelectedServiceStoreId("");
    setSearchResults([]);
    setSearchQuery("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="mode" value={mode} />
      {mode === "claim" ? (
        <input type="hidden" name="serviceStoreId" value={selectedServiceStoreId} />
      ) : null}

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

      {tenants.length === 0 ? (
        <p className="text-sm text-[#5b6b7a]">
          No tenants are available yet. Contact an administrator before continuing.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[#15202b]">Your profile</h2>

            <ServiceStoreFormField
              id="tenantId"
              label="Tenant"
              error={state.fieldErrors?.tenantId?.[0]}
            >
              <select
                id="tenantId"
                name="tenantId"
                required
                className={serviceStoreSelectClassName}
                value={tenantId}
                onChange={(event) => handleTenantChange(event.target.value)}
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
            </ServiceStoreFormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <ServiceStoreFormField
                id="firstName"
                label="First name"
                error={state.fieldErrors?.firstName?.[0]}
              >
                <input
                  id="firstName"
                  name="firstName"
                  required
                  className={serviceStoreInputClassName}
                  defaultValue={defaultFirstName}
                />
              </ServiceStoreFormField>
              <ServiceStoreFormField
                id="lastName"
                label="Last name"
                error={state.fieldErrors?.lastName?.[0]}
              >
                <input
                  id="lastName"
                  name="lastName"
                  required
                  className={serviceStoreInputClassName}
                  defaultValue={defaultLastName}
                />
              </ServiceStoreFormField>
            </div>

            <ServiceStoreFormField id="phone" label="Phone" error={state.fieldErrors?.phone?.[0]}>
              <input id="phone" name="phone" className={serviceStoreInputClassName} />
            </ServiceStoreFormField>

            <ServiceStoreFormField id="email" label="Email" error={state.fieldErrors?.email?.[0]}>
              <input
                id="email"
                name="email"
                type="email"
                className={serviceStoreInputClassName}
                defaultValue={defaultEmail}
              />
            </ServiceStoreFormField>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[#15202b]">Business setup</h2>

            <div className="flex flex-wrap gap-2">
              <ServiceStoreButton
                type="button"
                variant={mode === "claim" ? "primary" : "secondary"}
                onClick={() => setMode("claim")}
              >
                Claim existing business
              </ServiceStoreButton>
              <ServiceStoreButton
                type="button"
                variant={mode === "request" ? "primary" : "secondary"}
                onClick={() => setMode("request")}
              >
                Create new business
              </ServiceStoreButton>
            </div>

            {mode === "claim" ? (
              <div className="flex flex-col gap-4">
                <ServiceStoreFormField
                  id="serviceStoreSearch"
                  label="Search businesses"
                  error={state.fieldErrors?.serviceStoreId?.[0]}
                >
                  <input
                    id="serviceStoreSearch"
                    value={searchQuery}
                    onChange={(event) => handleSearchQueryChange(event.target.value)}
                    placeholder="Search by name or code"
                    className={serviceStoreInputClassName}
                    disabled={!tenantId}
                  />
                </ServiceStoreFormField>

                {!tenantId ? (
                  <p className="text-sm text-[#8a97a5]">
                    Select a tenant before searching for businesses.
                  </p>
                ) : null}
                {isSearching ? <p className="text-sm text-[#8a97a5]">Searching…</p> : null}

                {searchResults.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {searchResults.map((serviceStore) => (
                      <li key={serviceStore.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedServiceStoreId(serviceStore.id)}
                          className={cn(
                            "w-full rounded-xl border p-4 text-left text-sm transition-colors",
                            selectedServiceStoreId === serviceStore.id
                              ? "border-[#06C755] bg-[#ecfdf5]"
                              : "border-[#dce5ee] bg-white hover:bg-[#f4f7fa]",
                          )}
                        >
                          <div className="font-semibold text-[#15202b]">{serviceStore.name}</div>
                          <div className="mt-1 text-[#8a97a5]">
                            {serviceStore.code} · {serviceStore.status}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {tenantId &&
                searchQuery.trim().length >= 2 &&
                !isSearching &&
                searchResults.length === 0 ? (
                  <p className="text-sm text-[#8a97a5]">
                    No businesses found. Try another search or create a new business instead.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ServiceStoreFormField
                  id="businessName"
                  label="Business name"
                  error={state.fieldErrors?.businessName?.[0]}
                >
                  <input
                    id="businessName"
                    name="businessName"
                    required
                    className={serviceStoreInputClassName}
                  />
                </ServiceStoreFormField>
                <ServiceStoreFormField
                  id="businessCode"
                  label="Business code"
                  error={state.fieldErrors?.businessCode?.[0]}
                >
                  <input
                    id="businessCode"
                    name="businessCode"
                    required
                    placeholder="my-auto-shop"
                    className={serviceStoreInputClassName}
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
                  />
                </ServiceStoreFormField>
                <ServiceStoreFormField
                  id="businessPhone"
                  label="Business phone"
                  error={state.fieldErrors?.businessPhone?.[0]}
                >
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    className={serviceStoreInputClassName}
                  />
                </ServiceStoreFormField>
                <ServiceStoreFormField
                  id="businessEmail"
                  label="Business email"
                  error={state.fieldErrors?.businessEmail?.[0]}
                >
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    className={serviceStoreInputClassName}
                  />
                </ServiceStoreFormField>
                <ServiceStoreFormField
                  id="website"
                  label="Website"
                  error={state.fieldErrors?.website?.[0]}
                >
                  <input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    className={serviceStoreInputClassName}
                  />
                </ServiceStoreFormField>
              </div>
            )}
          </section>

          <ServiceStoreButton
            type="submit"
            disabled={isPending || !tenantId || (mode === "claim" && !selectedServiceStoreId)}
            className="w-full sm:w-auto"
          >
            {isPending ? "Submitting…" : "Submit for approval"}
          </ServiceStoreButton>
        </>
      )}
    </form>
  );
}
