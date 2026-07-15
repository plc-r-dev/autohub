"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  Building2,
  FileText,
  IdCard,
  ImagePlus,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui";
import {
  createServiceStoreDirect,
  searchServiceStoresAction,
  submitServiceStoreClaim,
  type OnboardingActionState,
} from "@/lib/onboarding/actions";
import { fetchClaimPrefillAction } from "@/lib/service-store/setup-actions";
import { cn } from "@workspace/ui/lib/utils";

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
  defaultMode = "claim",
}: {
  tenants: TenantOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail?: string;
  defaultMode?: "claim" | "create";
}) {
  const [mode, setMode] = useState<"claim" | "create">(defaultMode === "create" ? "create" : "claim");
  const [tenantId] = useState(tenants[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ServiceStoreResult[]>([]);
  const [selectedServiceStoreId, setSelectedServiceStoreId] = useState("");
  const [claimPrefill, setClaimPrefill] = useState<ClaimPrefill>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [claimState, claimAction, claimPending] = useActionState(submitServiceStoreClaim, initialState);
  const [createState, createAction, createPending] = useActionState(createServiceStoreDirect, initialState);
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);

  const state = mode === "claim" ? claimState : createState;
  const isPending = mode === "claim" ? claimPending : createPending;

  function handleCreateSubmit(formData: FormData) {
    if (createLogoFile) {
      formData.set("logoFile", createLogoFile);
    }
    createAction(formData);
  }

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

  async function handleSelectStore(store: ServiceStoreResult) {
    const prefill = await fetchClaimPrefillAction(store.id)
    setSelectedServiceStoreId(store.id)
    setSearchQuery(store.name)
    setSearchResults([])
    setClaimPrefill(prefill)
  }

  function handleClearSelectedStore() {
    setSelectedServiceStoreId("")
    setClaimPrefill(null)
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <div className="flex flex-col gap-8">
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Add store mode"
        className="flex border-b border-[#E2E8F0]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "claim"}
          onClick={() => setMode("claim")}
          className={
            mode === "claim"
              ? "border-b-2 border-[#16A34A] px-4 py-2.5 text-sm font-semibold text-[#15803D]"
              : "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
          }
        >
          Claim existing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "create"}
          onClick={() => setMode("create")}
          className={
            mode === "create"
              ? "border-b-2 border-[#16A34A] px-4 py-2.5 text-sm font-semibold text-[#15803D]"
              : "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
          }
        >
          Create new
        </button>
      </div>

      {mode === "claim" ? (
        <form action={claimAction} className="flex flex-col gap-8">
          <input type="hidden" name="tenantId" value={tenantId} />

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Find your business
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Search the AutoHub directory, then review the details before
                submitting.
              </p>
            </div>

            {selectedServiceStoreId ? (
              <>
                <input
                  type="hidden"
                  name="serviceStoreId"
                  value={selectedServiceStoreId}
                />
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {claimPrefill?.proposedName || searchQuery}
                    </p>
                    {claimPrefill?.proposedAddress ? (
                      <p className="mt-0.5 truncate text-sm text-[#64748B]">
                        {claimPrefill.proposedAddress}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelectedStore}
                    className="shrink-0 text-sm font-medium text-[#15803D] hover:underline"
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <div className="relative max-w-xl">
                <ServiceStoreFormField
                  id="serviceStoreSearch"
                  label="Search AutoHub directory"
                  required
                  error={claimState.fieldErrors?.serviceStoreId?.[0]}
                >
                  <input
                    id="serviceStoreSearch"
                    value={searchQuery}
                    onChange={(event) =>
                      handleSearchQueryChange(event.target.value)
                    }
                    placeholder="Search by name or code"
                    className={serviceStoreInputClassName}
                    disabled={!tenantId}
                    autoComplete="off"
                  />
                </ServiceStoreFormField>
                {isSearching ? (
                  <p className="absolute top-full z-10 mt-1 text-sm text-[#64748B]">
                    Searching…
                  </p>
                ) : null}
                {searchResults.length > 0 ? (
                  <ul className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg">
                    {searchResults.map((store) => (
                      <li key={store.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectStore(store)}
                          className="flex w-full flex-col px-3 py-2.5 text-left hover:bg-[#F8FAFC]"
                        >
                          <span className="text-sm font-medium text-[#0F172A]">
                            {store.name}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {store.code} · {store.status}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </section>

          {selectedServiceStoreId && claimPrefill ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <ClaimReviewFields
                key={selectedServiceStoreId}
                prefill={claimPrefill}
                fieldErrors={claimState.fieldErrors}
              />
              <div className="flex flex-col gap-8">
                <ClaimProfileFields
                  defaultFirstName={defaultFirstName}
                  defaultLastName={defaultLastName}
                  fieldErrors={claimState.fieldErrors}
                />
                <ClaimDocumentFields fieldErrors={claimState.fieldErrors} />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <ClaimProfileFields
                defaultFirstName={defaultFirstName}
                defaultLastName={defaultLastName}
                fieldErrors={claimState.fieldErrors}
              />
              <ClaimDocumentFields fieldErrors={claimState.fieldErrors} />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-6">
            <ServiceStoreButton
              type="submit"
              disabled={isPending || !selectedServiceStoreId}
            >
              {isPending ? "Submitting…" : "Submit claim for approval"}
            </ServiceStoreButton>
          </div>
        </form>
      ) : (
        <form action={handleCreateSubmit} className="flex flex-col gap-8">
          <input type="hidden" name="tenantId" value={tenantId} />

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Store details
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Basic information for your new Service Store.
                </p>
              </div>
              <ServiceStoreFormField
                id="businessName"
                label="Store name"
                required
                error={createState.fieldErrors?.businessName?.[0]}
              >
                <input
                  id="businessName"
                  name="businessName"
                  required
                  className={serviceStoreInputClassName}
                />
              </ServiceStoreFormField>
              <ServiceStoreFormField
                id="address"
                label="Address"
                required
                error={createState.fieldErrors?.address?.[0]}
              >
                <input
                  id="address"
                  name="address"
                  required
                  className={serviceStoreInputClassName}
                />
              </ServiceStoreFormField>
              <ServiceStoreFormField
                id="googleMapsUrl"
                label="Google Maps link"
                required
                error={createState.fieldErrors?.googleMapsUrl?.[0]}
              >
                <input
                  id="googleMapsUrl"
                  name="googleMapsUrl"
                  type="url"
                  required
                  placeholder="https://maps.google.com/..."
                  className={serviceStoreInputClassName}
                />
              </ServiceStoreFormField>
              <ServiceStoreFormField
                id="description"
                label="Description (optional)"
                error={createState.fieldErrors?.description?.[0]}
              >
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={serviceStoreTextareaClassName}
                />
              </ServiceStoreFormField>
              <DocumentUploadField
                id="logoFile"
                name="logoFile"
                label="Store logo"
                description="Square JPG, PNG, or WebP — max 5 MB"
                icon={ImagePlus}
                accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                required={false}
                error={createState.fieldErrors?.logoFile?.[0]}
                onFileChange={setCreateLogoFile}
              />
            </section>

            <div className="flex flex-col gap-8">
              <CreateProfileFields
                defaultFirstName={defaultFirstName}
                defaultLastName={defaultLastName}
                fieldErrors={createState.fieldErrors}
              />
              <ClaimDocumentFields fieldErrors={createState.fieldErrors} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-6">
            <ServiceStoreButton type="submit" disabled={isPending}>
              {isPending ? "Submitting…" : "Submit for approval"}
            </ServiceStoreButton>
          </div>
        </form>
      )}
    </div>
  );
}

function ClaimProfileFields({
  defaultFirstName,
  defaultLastName,
  fieldErrors,
}: {
  defaultFirstName: string
  defaultLastName: string
  fieldErrors?: Record<string, string[]>
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">Your profile</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Contact details for this claim.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField
          id="firstName"
          label="First name"
          required
          error={fieldErrors?.firstName?.[0]}
        >
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={defaultFirstName}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
        <ServiceStoreFormField
          id="lastName"
          label="Last name"
          required
          error={fieldErrors?.lastName?.[0]}
        >
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
    </section>
  )
}

function CreateProfileFields({
  defaultFirstName,
  defaultLastName,
  fieldErrors,
}: {
  defaultFirstName: string
  defaultLastName: string
  fieldErrors?: Record<string, string[]>
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">Your profile</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Owner contact details for the new store.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceStoreFormField
          id="createFirstName"
          label="First name"
          required
          error={fieldErrors?.firstName?.[0]}
        >
          <input
            id="createFirstName"
            name="firstName"
            required
            defaultValue={defaultFirstName}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
        <ServiceStoreFormField
          id="createLastName"
          label="Last name"
          required
          error={fieldErrors?.lastName?.[0]}
        >
          <input
            id="createLastName"
            name="lastName"
            required
            defaultValue={defaultLastName}
            className={serviceStoreInputClassName}
          />
        </ServiceStoreFormField>
      </div>
      <ServiceStoreFormField
        id="createPhone"
        label="Phone"
        required
        error={fieldErrors?.phone?.[0]}
      >
        <input
          id="createPhone"
          name="phone"
          required
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
    </section>
  )
}

function ClaimDocumentFields({
  fieldErrors,
}: {
  fieldErrors?: Record<string, string[]>
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Supporting documents
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Upload clear scans or photos. JPG, PNG, or PDF — max 5 MB each.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DocumentUploadField
          id="citizenIdFile"
          name="citizenIdFile"
          label="Citizen ID"
          description="Thai national ID of the store owner"
          icon={IdCard}
          error={fieldErrors?.citizenIdFile?.[0]}
        />
        <DocumentUploadField
          id="companyDocumentFile"
          name="companyDocumentFile"
          label="Store document"
          description="Business license or company registration"
          icon={Building2}
          error={fieldErrors?.companyDocumentFile?.[0]}
        />
      </div>
    </section>
  )
}

function DocumentUploadField({
  id,
  name,
  label,
  description,
  icon: Icon,
  error,
  accept = "image/jpeg,image/jpg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf",
  required = true,
  onFileChange,
}: {
  id: string
  name: string
  label: string
  description: string
  icon: LucideIcon
  error?: string
  accept?: string
  required?: boolean
  onFileChange?: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function updateFile(next: File | null) {
    setFile(next)
    onFileChange?.(next)
  }

  function assignFile(next: File | undefined) {
    if (!next || !inputRef.current) return
    const transfer = new DataTransfer()
    transfer.items.add(next)
    inputRef.current.files = transfer.files
    updateFile(next)
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    updateFile(null)
  }

  function formatBytes(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-[#0F172A]">
            {label}
            {required ? (
              <span className="ml-1 text-[#DC2626]" aria-hidden>
                *
              </span>
            ) : null}
          </label>
          <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        required={required && !file}
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          updateFile(event.target.files?.[0] ?? null)
        }}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-sm">
            <FileText className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#0F172A]">
              {file.name}
            </p>
            <p className="text-xs text-[#64748B]">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-white hover:text-[#DC2626]"
            aria-label={`Remove ${label}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            assignFile(event.dataTransfer.files?.[0])
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-7 text-center transition-colors",
            isDragging
              ? "border-[#16A34A] bg-[#16A34A]/5"
              : error
                ? "border-[#FECACA] bg-[#FEF2F2] hover:border-[#F87171]"
                : "border-[#D7E0E9] bg-[#F8FAFC] hover:border-[#16A34A]/60 hover:bg-[#F0FDF4]",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#16A34A] shadow-sm">
            <Upload className="size-4" aria-hidden />
          </div>
          <p className="text-sm text-[#64748B]">
            Drag & drop or{" "}
            <span className="font-semibold text-[#16A34A]">browse</span>
          </p>
          <p className="text-xs text-[#94A3B8]">JPG, PNG, or PDF · max 5 MB</p>
        </button>
      )}

      {error ? (
        <p className="text-sm text-[#DC2626]">{error}</p>
      ) : null}
    </div>
  )
}

function ClaimReviewFields({
  prefill,
  fieldErrors,
}: {
  prefill: ClaimPrefill
  fieldErrors?: Record<string, string[]>
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Business details
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Prefilled from the directory. Edit anything that looks wrong.
        </p>
      </div>
      <input
        type="hidden"
        name="googlePlaceId"
        value={prefill?.googlePlaceId ?? ""}
      />
      <input
        type="hidden"
        name="businessCategory"
        value={prefill?.businessCategory ?? ""}
      />
      <input
        type="hidden"
        name="proposedLatitude"
        value={prefill?.proposedLatitude?.toString() ?? ""}
      />
      <input
        type="hidden"
        name="proposedLongitude"
        value={prefill?.proposedLongitude?.toString() ?? ""}
      />
      <ServiceStoreFormField
        id="proposedName"
        label="Store name"
        required
        error={fieldErrors?.proposedName?.[0]}
      >
        <input
          id="proposedName"
          name="proposedName"
          required
          defaultValue={prefill?.proposedName ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField
        id="proposedPhone"
        label="Phone"
        required
        error={fieldErrors?.proposedPhone?.[0]}
      >
        <input
          id="proposedPhone"
          name="proposedPhone"
          required
          defaultValue={prefill?.proposedPhone ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField
        id="proposedAddress"
        label="Address"
        required
        error={fieldErrors?.proposedAddress?.[0]}
      >
        <input
          id="proposedAddress"
          name="proposedAddress"
          required
          defaultValue={prefill?.proposedAddress ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField
        id="proposedWebsite"
        label="Website"
        error={fieldErrors?.proposedWebsite?.[0]}
      >
        <input
          id="proposedWebsite"
          name="proposedWebsite"
          type="url"
          defaultValue={prefill?.proposedWebsite ?? ""}
          className={serviceStoreInputClassName}
        />
      </ServiceStoreFormField>
      <ServiceStoreFormField
        id="proposedDescription"
        label="Description"
        error={fieldErrors?.proposedDescription?.[0]}
      >
        <textarea
          id="proposedDescription"
          name="proposedDescription"
          rows={4}
          defaultValue={prefill?.proposedDescription ?? ""}
          className={serviceStoreTextareaClassName}
        />
      </ServiceStoreFormField>
      {(fieldErrors?.proposedLatitude?.[0] ||
        fieldErrors?.proposedLongitude?.[0]) && (
        <p className="text-sm text-red-600">
          Location coordinates are missing for this store. Ask support to update
          the directory entry, or choose another store.
        </p>
      )}
    </section>
  )
}
