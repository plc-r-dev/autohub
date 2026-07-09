"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import {
  completeMerchantOnboarding,
  searchMerchantsAction,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";

type TenantOption = {
  id: string;
  code: string;
  name: string;
};

type MerchantResult = {
  id: string;
  name: string;
  code: string;
  status: string;
  phone: string | null;
  email: string | null;
};

type MerchantOnboardingFormProps = {
  tenants: TenantOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
};

const initialState: OnboardingActionState = {};

export function MerchantOnboardingForm({
  tenants,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
}: MerchantOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeMerchantOnboarding,
    initialState,
  );
  const [mode, setMode] = useState<"claim" | "request">("claim");
  const [tenantId, setTenantId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MerchantResult[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (mode !== "claim" || !tenantId || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const results = await searchMerchantsAction(tenantId, value);
        setSearchResults(results);
      });
    }, 300);
  }

  function handleTenantChange(value: string) {
    setTenantId(value);
    setSelectedMerchantId("");
    setSearchResults([]);
    setSearchQuery("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="mode" value={mode} />
      {mode === "claim" ? (
        <input type="hidden" name="merchantId" value={selectedMerchantId} />
      ) : null}

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
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-medium">Your profile</h2>

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
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-medium">Business setup</h2>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "claim" ? "default" : "outline"}
                onClick={() => setMode("claim")}
              >
                Claim existing business
              </Button>
              <Button
                type="button"
                variant={mode === "request" ? "default" : "outline"}
                onClick={() => setMode("request")}
              >
                Request new business
              </Button>
            </div>

            {mode === "claim" ? (
              <div className="flex flex-col gap-4">
                <FormField
                  id="merchantSearch"
                  label="Search businesses"
                  error={state.fieldErrors?.merchantId?.[0]}
                >
                  <input
                    id="merchantSearch"
                    value={searchQuery}
                    onChange={(event) =>
                      handleSearchQueryChange(event.target.value)
                    }
                    placeholder="Search by name or code"
                    className={inputClassName}
                    disabled={!tenantId}
                  />
                </FormField>

                {!tenantId ? (
                  <p className="text-muted-foreground text-sm">
                    Select a tenant before searching for businesses.
                  </p>
                ) : null}

                {isSearching ? (
                  <p className="text-muted-foreground text-sm">Searching...</p>
                ) : null}

                {searchResults.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {searchResults.map((merchant) => (
                      <li key={merchant.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedMerchantId(merchant.id)}
                          className={`border-input hover:bg-muted w-full rounded-md border p-3 text-left text-sm ${
                            selectedMerchantId === merchant.id
                              ? "border-primary bg-muted"
                              : ""
                          }`}
                        >
                          <div className="font-medium">{merchant.name}</div>
                          <div className="text-muted-foreground">
                            {merchant.code} · {merchant.status}
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
                  <p className="text-muted-foreground text-sm">
                    No businesses found. Try another search or request a new
                    business instead.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <FormField
                  id="businessName"
                  label="Business name"
                  error={state.fieldErrors?.businessName?.[0]}
                >
                  <input
                    id="businessName"
                    name="businessName"
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  id="businessCode"
                  label="Business code"
                  error={state.fieldErrors?.businessCode?.[0]}
                >
                  <input
                    id="businessCode"
                    name="businessCode"
                    required
                    placeholder="my-auto-shop"
                    className={inputClassName}
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
                  />
                </FormField>

                <FormField
                  id="businessPhone"
                  label="Business phone"
                  error={state.fieldErrors?.businessPhone?.[0]}
                >
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  id="businessEmail"
                  label="Business email"
                  error={state.fieldErrors?.businessEmail?.[0]}
                >
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  id="website"
                  label="Website"
                  error={state.fieldErrors?.website?.[0]}
                >
                  <input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    className={inputClassName}
                  />
                </FormField>
              </div>
            )}
          </section>

          <Button
            type="submit"
            disabled={
              isPending ||
              !tenantId ||
              (mode === "claim" && !selectedMerchantId)
            }
          >
            {isPending ? "Submitting..." : "Complete merchant onboarding"}
          </Button>
        </>
      )}
    </form>
  );
}
