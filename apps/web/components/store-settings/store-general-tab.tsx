"use client"

import { useActionState, useEffect, useState } from "react"
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
  saveStoreGeneral,
  type StoreSettingsActionResult,
} from "@/lib/service-store/store-settings-actions"

type StoreGeneralTabProps = {
  general: StoreSettingsGeneral
}

const initialState: StoreSettingsActionResult = { ok: true }

export function StoreGeneralTab({ general }: StoreGeneralTabProps) {
  const [state, formAction, isPending] = useActionState(saveStoreGeneral, initialState)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [removedGalleryKeys, setRemovedGalleryKeys] = useState<string[]>([])
  const [pendingGallery, setPendingGallery] = useState<
    Array<{ id: string; previewUrl: string; file: File }>
  >([])
  const [addPhotoKey, setAddPhotoKey] = useState(0)

  useEffect(() => {
    if (!state.ok || !state.message) {
      return
    }

    setLogoRemoved(false)
    setRemovedGalleryKeys([])
    setPendingGallery((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return []
    })
    setAddPhotoKey((key) => key + 1)
  }, [state])

  function handleSubmit(formData: FormData) {
    if (logoRemoved) {
      formData.set("removeLogo", "true")
    }

    for (const key of removedGalleryKeys) {
      formData.append("removedGalleryKeys", key)
    }

    for (const item of pendingGallery) {
      formData.append("gallery", item.file)
    }

    formAction(formData)
  }

  function addPendingGallery(file: File) {
    setPendingGallery((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
        file,
      },
    ])
  }

  function removePendingGallery(id: string) {
    setPendingGallery((current) => {
      const item = current.find((entry) => entry.id === id)
      if (item) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return current.filter((entry) => entry.id !== id)
    })
  }

  const visibleGallery = general.galleryImages.filter(
    (image) => !removedGalleryKeys.includes(image.key),
  )

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
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

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <ServiceStoreCard className="flex h-full flex-col space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Store information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Details shown on the marketplace, browse page, and LINE OA.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-5">
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
                rows={3}
                className={serviceStoreTextareaClassName}
                defaultValue={general.address}
              />
            </ServiceStoreFormField>
          </div>
        </ServiceStoreCard>

        <ServiceStoreCard className="flex h-full flex-col space-y-5">
          <StoreImageUploadCard
            label="Store logo"
            description="Square image works best."
            imageUrl={general.logoUrl}
            aspectClassName="aspect-square w-full max-w-[140px]"
            deferUpload
            inputName="logo"
            removed={logoRemoved}
            onFileSelect={(file) => {
              if (file) {
                setLogoRemoved(false)
              }
            }}
            onMarkRemove={() => setLogoRemoved(true)}
          />

          <div className="flex flex-1 flex-col space-y-2 border-t border-border pt-4">
            <div>
              <p className="text-xs font-medium text-foreground">Additional store photos</p>
              <p className="text-[11px] text-muted-foreground">
                {visibleGallery.length + pendingGallery.length} photo
                {visibleGallery.length + pendingGallery.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {visibleGallery.map((image) => (
                <StoreImageUploadCard
                  key={image.key}
                  label="Store photo"
                  imageUrl={image.url}
                  compact
                  allowReplace={false}
                  deferUpload
                  onMarkRemove={() => {
                    setRemovedGalleryKeys((current) => [...current, image.key])
                  }}
                />
              ))}
              {pendingGallery.map((item) => (
                <StoreImageUploadCard
                  key={item.id}
                  label="New photo"
                  imageUrl={item.previewUrl}
                  compact
                  allowReplace={false}
                  deferUpload
                  onMarkRemove={() => removePendingGallery(item.id)}
                />
              ))}
              <StoreImageUploadCard
                key={addPhotoKey}
                label="Add photo"
                compact
                deferUpload
                onFileSelect={(file) => {
                  if (file) {
                    addPendingGallery(file)
                    setAddPhotoKey((key) => key + 1)
                  }
                }}
              />
            </div>
          </div>
        </ServiceStoreCard>
      </div>

      <div>
        <ServiceStoreButton
          type="submit"
          disabled={isPending}
          className="h-9 px-3.5 text-sm"
        >
          {isPending ? "Saving…" : "Save changes"}
        </ServiceStoreButton>
      </div>
    </form>
  )
}
