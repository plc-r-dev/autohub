"use client"

import { useActionState } from "react"
import {
  ServiceStoreButton,
  ServiceStoreCard,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui"
import { StoreImageUploadCard } from "@/components/store-settings/store-image-upload-card"
import type { StoreSettingsGeneral } from "@/lib/service-store/store-settings-queries"
import {
  removeStoreCover,
  removeStoreGalleryImage,
  removeStoreLogo,
  saveStoreGeneral,
  uploadStoreCover,
  uploadStoreLogo,
  uploadStoreGalleryImage,
  type StoreSettingsActionResult,
} from "@/lib/service-store/store-settings-actions"

type StoreGeneralTabProps = {
  general: StoreSettingsGeneral
}

const initialState: StoreSettingsActionResult = { ok: true }

export function StoreGeneralTab({ general }: StoreGeneralTabProps) {
  const [state, formAction, isPending] = useActionState(saveStoreGeneral, initialState)

  return (
    <div className="flex flex-col gap-6">
      <ServiceStoreCard className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Store information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Details shown on the marketplace, browse page, and LINE OA.
          </p>
        </div>

        <form action={formAction} className="flex max-w-2xl flex-col gap-5">
          {!state.ok && state.error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {state.error}
            </p>
          ) : null}
          {state.ok && state.message ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              {state.message}
            </p>
          ) : null}

          <ServiceStoreFormField
            id="name"
            label="Store name"
            error={!state.ok ? state.fieldErrors?.name?.[0] : undefined}
          >
            <input
              id="name"
              name="name"
              required
              className={serviceStoreInputClassName}
              defaultValue={general.name}
            />
          </ServiceStoreFormField>

          <ServiceStoreFormField
            id="description"
            label="Description"
            error={!state.ok ? state.fieldErrors?.description?.[0] : undefined}
          >
            <textarea
              id="description"
              name="description"
              rows={4}
              className={serviceStoreTextareaClassName}
              defaultValue={general.description}
            />
          </ServiceStoreFormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <ServiceStoreFormField
              id="phone"
              label="Phone number"
              error={!state.ok ? state.fieldErrors?.phone?.[0] : undefined}
            >
              <input
                id="phone"
                name="phone"
                className={serviceStoreInputClassName}
                defaultValue={general.phone}
              />
            </ServiceStoreFormField>

            <ServiceStoreFormField
              id="email"
              label="Email"
              error={!state.ok ? state.fieldErrors?.email?.[0] : undefined}
            >
              <input
                id="email"
                name="email"
                type="email"
                className={serviceStoreInputClassName}
                defaultValue={general.email}
              />
            </ServiceStoreFormField>
          </div>

          <ServiceStoreFormField
            id="address"
            label="Address"
            error={!state.ok ? state.fieldErrors?.address?.[0] : undefined}
          >
            <textarea
              id="address"
              name="address"
              rows={2}
              className={serviceStoreTextareaClassName}
              defaultValue={general.address}
            />
          </ServiceStoreFormField>

          <ServiceStoreButton type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving…" : "Save changes"}
          </ServiceStoreButton>
        </form>
      </ServiceStoreCard>

      <ServiceStoreCard className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Store images</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used across marketplace, browse, LINE OA, and your store profile.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <StoreImageUploadCard
            label="Store logo"
            description="Square image works best."
            imageUrl={general.logoUrl}
            aspectClassName="aspect-square max-w-xs"
            onUpload={uploadStoreLogo}
            onRemove={removeStoreLogo}
          />
          <StoreImageUploadCard
            label="Cover image"
            description="Wide banner for your store profile."
            imageUrl={general.coverImageUrl}
            aspectClassName="aspect-[16/9]"
            onUpload={uploadStoreCover}
            onRemove={removeStoreCover}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Additional store photos</p>
            <p className="text-xs text-muted-foreground">
              Showcase your shop on the marketplace and browse page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {general.galleryImages.map((image) => (
              <StoreImageUploadCard
                key={image.key}
                label="Store photo"
                imageUrl={image.url}
                aspectClassName="aspect-[4/3]"
                allowReplace={false}
                onUpload={async () => ({ ok: true })}
                onRemove={() => removeStoreGalleryImage(image.key)}
              />
            ))}
            <StoreImageUploadCard
              label="Add photo"
              aspectClassName="aspect-[4/3]"
              onUpload={uploadStoreGalleryImage}
            />
          </div>
        </div>
      </ServiceStoreCard>
    </div>
  )
}
