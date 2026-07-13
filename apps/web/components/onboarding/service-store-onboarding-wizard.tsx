"use client";

import { useActionState, useState, useTransition } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { GooglePlacesAutocomplete } from "@/components/onboarding/google-places-autocomplete";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import {
  createServiceStoreDirect,
  searchServiceStoresAction,
  submitServiceStoreClaim,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";
import { fetchClaimPrefillAction } from "@/lib/service-store/setup-actions";
import { SERVICE_STORE_BUSINESS_CATEGORIES } from "@/lib/service-store/domain";

type TenantOption = { id: string; code: string; name: string };

type ServiceStoreResult = {
  id: string;
  name: string;
  code: string;
  status: string;
  phone: string | null;
  email: string | null;
};

type ClaimPrefill = Awaited<ReturnType<typeof fetchClaimPrefillAction>>;

const initialState: OnboardingActionState = {};

export function ServiceStoreOnboardingWizard({
  tenants,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultMode = "claim",
}: {
  tenants: TenantOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultMode?: "claim" | "create";
}) {
  const [mode, setMode] = useState<"claim" | "create">(defaultMode === "create" ? "create" : "claim");
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ServiceStoreResult[]>([]);
  const [selectedServiceStoreId, setSelectedServiceStoreId] = useState("");
  const [claimPrefill, setClaimPrefill] = useState<ClaimPrefill>(null);
  const [createPlaceId, setCreatePlaceId] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const [claimState, claimAction, claimPending] = useActionState(submitServiceStoreClaim, initialState);
  const [createState, createAction, createPending] = useActionState(createServiceStoreDirect, initialState);

  const state = mode === "claim" ? claimState : createState;
  const isPending = mode === "claim" ? claimPending : createPending;

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    if (!tenantId || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    startSearchTransition(async () => {
      const results = await searchServiceStoresAction(tenantId, value);
      setSearchResults(results);
    });
  }

  async function handleSelectStore(serviceStoreId: string) {
    setSelectedServiceStoreId(serviceStoreId);
    const prefill = await fetchClaimPrefillAction(serviceStoreId);
    setClaimPrefill(prefill);
  }

  return (
    <div className="flex flex-col gap-6">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ServiceStoreButton
          type="button"
          variant={mode === "claim" ? "primary" : "secondary"}
          onClick={() => setMode("claim")}
        >
          Claim existing store
        </ServiceStoreButton>
        <ServiceStoreButton
          type="button"
          variant={mode === "create" ? "primary" : "secondary"}
          onClick={() => setMode("create")}
        >
          Create new store
        </ServiceStoreButton>
      </div>

      {mode === "claim" ? (
        <form action={claimAction} className="flex flex-col gap-6">
          <ProfileFields
            tenants={tenants}
            tenantId={tenantId}
            onTenantChange={setTenantId}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            defaultEmail={defaultEmail}
            fieldErrors={claimState.fieldErrors}
          />

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[#0F172A]">Find your business</h2>
            <ServiceStoreFormField
              id="serviceStoreSearch"
              label="Search AutoHub directory"
              error={claimState.fieldErrors?.serviceStoreId?.[0]}
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
            {isSearching ? <p className="text-sm text-[#8a97a5]">Searching…</p> : null}
            {searchResults.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {searchResults.map((store) => (
                  <li key={store.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectStore(store.id)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left text-sm",
                        selectedServiceStoreId === store.id
                          ? "border-[#16A34A] bg-[#F0FDF4]"
                          : "border-[#dce5ee] bg-white hover:bg-[#f4f7fa]",
                      )}
                    >
                      <div className="font-semibold text-[#0F172A]">{store.name}</div>
                      <div className="mt-1 text-[#8a97a5]">
                        {store.code} · {store.status}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {selectedServiceStoreId ? (
            <>
              <input type="hidden" name="serviceStoreId" value={selectedServiceStoreId} />
              <GooglePlacesAutocomplete
                label="Link Google Places listing (optional)"
                onSelect={(place) => {
                  setClaimPrefill((current) => ({
                    ...(current ?? { serviceStoreId: selectedServiceStoreId }),
                    googlePlaceId: place.placeId,
                    proposedName: place.name,
                    proposedPhone: place.phone ?? current?.proposedPhone ?? "",
                    proposedAddress: place.formattedAddress ?? current?.proposedAddress ?? "",
                    proposedLatitude: place.latitude,
                    proposedLongitude: place.longitude,
                    proposedWebsite: place.website ?? current?.proposedWebsite ?? "",
                    proposedDescription: place.description ?? current?.proposedDescription ?? "",
                    businessCategory: current?.businessCategory ?? null,
                    proposedEmail: current?.proposedEmail ?? "",
                  }));
                }}
              />

              <ClaimReviewFields prefill={claimPrefill} fieldErrors={claimState.fieldErrors} />
            </>
          ) : null}

          <ServiceStoreButton type="submit" disabled={isPending || !selectedServiceStoreId}>
            {isPending ? "Submitting…" : "Submit claim for approval"}
          </ServiceStoreButton>
        </form>
      ) : (
        <form action={createAction} id="create-business-form" className="flex flex-col gap-6">
          <ProfileFields
            tenants={tenants}
            tenantId={tenantId}
            onTenantChange={setTenantId}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            defaultEmail={defaultEmail}
            fieldErrors={createState.fieldErrors}
          />

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[#0F172A]">Business details</h2>
            <GooglePlacesAutocomplete
              onSelect={(place) => {
                setCreatePlaceId(place.placeId);
                const form = document.getElementById("create-business-form") as HTMLFormElement | null;
                if (!form) return;
                setInput(form, "businessName", place.name);
                setInput(form, "businessPhone", place.phone ?? "");
                setInput(form, "address", place.formattedAddress ?? "");
                setInput(form, "latitude", place.latitude?.toString() ?? "");
                setInput(form, "longitude", place.longitude?.toString() ?? "");
                setInput(form, "description", place.description ?? "");
                setInput(form, "website", place.website ?? "");
              }}
            />
            <input type="hidden" name="googlePlaceId" value={createPlaceId} />
            <CreateMinimumFields fieldErrors={createState.fieldErrors} />
          </section>

          <ServiceStoreButton type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create Service Store"}
          </ServiceStoreButton>
        </form>
      )}
    </div>
  );
}

function setInput(form: HTMLFormElement, name: string, value: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  if (input) {
    input.value = value;
  }
}

function ProfileFields({
  tenants,
  tenantId,
  onTenantChange,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  fieldErrors,
}: {
  tenants: TenantOption[];
  tenantId: string;
  onTenantChange: (value: string) => void;
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  fieldErrors?: Record<string, string[]>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[#0F172A]">Your profile</h2>
      <ServiceStoreFormField id="tenantId" label="Tenant" error={fieldErrors?.tenantId?.[0]}>
        <select
          id="tenantId"
          name="tenantId"
          required
          className={serviceStoreSelectClassName}
          value={tenantId}
          onChange={(event) => onTenantChange(event.target.value)}
        >
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name} ({tenant.code})
            </option>
          ))}
        </select>
      </ServiceStoreFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField id="firstName" label="First name" error={fieldErrors?.firstName?.[0]}>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={defaultFirstName}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
        <ServiceStoreFormField id="lastName" label="Last name" error={fieldErrors?.lastName?.[0]}>
          <input
            id="lastName"
            name="lastName"
            required
            defaultValue={defaultLastName}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
      </div>
      <ServiceStoreFormField id="phone" label="Phone" error={fieldErrors?.phone?.[0]}>
        <input id="phone" name="phone" className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="email" label="Email" error={fieldErrors?.email?.[0]}>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultEmail}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
    </section>
  );
}

function ClaimReviewFields({
  prefill,
  fieldErrors,
}: {
  prefill: ClaimPrefill;
  fieldErrors?: Record<string, string[]>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[#0F172A]">Review business information</h2>
      <p className="text-sm text-[#5b6b7a]">
        We prefilled details from Google Places where available. Edit any missing fields before
        submitting.
      </p>
      <input type="hidden" name="googlePlaceId" value={prefill?.googlePlaceId ?? ""} />
      <CategoryField defaultValue={prefill?.businessCategory ?? ""} error={fieldErrors?.businessCategory?.[0]} />
      <ServiceStoreFormField id="proposedName" label="Store name" error={fieldErrors?.proposedName?.[0]}>
        <input
          id="proposedName"
          name="proposedName"
          required
          defaultValue={prefill?.proposedName ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="proposedPhone" label="Phone" error={fieldErrors?.proposedPhone?.[0]}>
        <input
          id="proposedPhone"
          name="proposedPhone"
          required
          defaultValue={prefill?.proposedPhone ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="proposedAddress" label="Address" error={fieldErrors?.proposedAddress?.[0]}>
        <input
          id="proposedAddress"
          name="proposedAddress"
          required
          defaultValue={prefill?.proposedAddress ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField id="proposedLatitude" label="Latitude" error={fieldErrors?.proposedLatitude?.[0]}>
          <input
            id="proposedLatitude"
            name="proposedLatitude"
            required
            defaultValue={prefill?.proposedLatitude?.toString() ?? ""}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
        <ServiceStoreFormField id="proposedLongitude" label="Longitude" error={fieldErrors?.proposedLongitude?.[0]}>
          <input
            id="proposedLongitude"
            name="proposedLongitude"
            required
            defaultValue={prefill?.proposedLongitude?.toString() ?? ""}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
      </div>
      <ServiceStoreFormField id="proposedEmail" label="Email" error={fieldErrors?.proposedEmail?.[0]}>
        <input
          id="proposedEmail"
          name="proposedEmail"
          type="email"
          defaultValue={prefill?.proposedEmail ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="proposedWebsite" label="Website" error={fieldErrors?.proposedWebsite?.[0]}>
        <input
          id="proposedWebsite"
          name="proposedWebsite"
          type="url"
          defaultValue={prefill?.proposedWebsite ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="proposedDescription" label="Description" error={fieldErrors?.proposedDescription?.[0]}>
        <textarea
          id="proposedDescription"
          name="proposedDescription"
          defaultValue={prefill?.proposedDescription ?? ""}
          className={serviceStoreTextareaClassName}
        />
      </ServiceStoreFormField>
    </section>
  );
}

function CreateMinimumFields({ fieldErrors }: { fieldErrors?: Record<string, string[]> }) {
  return (
    <>
      <CategoryField error={fieldErrors?.businessCategory?.[0]} />
      <ServiceStoreFormField id="businessName" label="Store name" error={fieldErrors?.businessName?.[0]}>
        <input id="businessName" name="businessName" required className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="businessPhone" label="Phone" error={fieldErrors?.businessPhone?.[0]}>
        <input id="businessPhone" name="businessPhone" required className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="address" label="Address" error={fieldErrors?.address?.[0]}>
        <input id="address" name="address" required className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField id="latitude" label="Latitude" error={fieldErrors?.latitude?.[0]}>
          <input id="latitude" name="latitude" required className={serviceStoreInputClassName} />
        </ServiceStoreFormField>
        <ServiceStoreFormField id="longitude" label="Longitude" error={fieldErrors?.longitude?.[0]}>
          <input id="longitude" name="longitude" required className={serviceStoreInputClassName} />
        </ServiceStoreFormField>
      </div>
      <ServiceStoreFormField id="description" label="Description (optional)" error={fieldErrors?.description?.[0]}>
        <textarea id="description" name="description" className={serviceStoreTextareaClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="businessEmail" label="Email (optional)" error={fieldErrors?.businessEmail?.[0]}>
        <input id="businessEmail" name="businessEmail" type="email" className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
      <ServiceStoreFormField id="website" label="Website (optional)" error={fieldErrors?.website?.[0]}>
        <input id="website" name="website" type="url" className={serviceStoreInputClassName} />
      </ServiceStoreFormField>
    </>
  );
}

function CategoryField({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  return (
    <ServiceStoreFormField id="businessCategory" label="Business category" error={error}>
      <select
        id="businessCategory"
        name="businessCategory"
        required
        defaultValue={defaultValue}
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
  );
}
