"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { DetailModalShell } from "@/components/service-store/modals/detail-modal-shell"
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreTextareaClassName,
} from "@/components/service-store/ui"
import { saveStoreService } from "@/lib/service-store/store-settings-actions"

export type ServiceFormValues = {
  id?: string
  name: string
  description: string
  duration: number
  bufferMinutes: number
  price: string
  imageUrl?: string | null
}

type ServiceFormModalProps = {
  open: boolean
  mode: "create" | "edit"
  initialValues?: ServiceFormValues
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ServiceFormModal({
  open,
  mode,
  initialValues,
  onOpenChange,
  onSaved,
}: ServiceFormModalProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setPreviewUrl(initialValues?.imageUrl ?? null)
      setError(null)
      setFieldErrors({})
    }
  }, [open, initialValues])

  function handleClose() {
    onOpenChange(false)
    setError(null)
    setFieldErrors({})
    setPreviewUrl(initialValues?.imageUrl ?? null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await saveStoreService(formData)
      if (!result.ok) {
        setError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      onSaved()
      handleClose()
    })
  }

  return (
    <DetailModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose()
          return
        }
        onOpenChange(nextOpen)
      }}
      header={
        <p className="text-lg font-semibold text-foreground">
          {mode === "create" ? "New service" : "Edit service"}
        </p>
      }
      footer={
        <div className="flex w-full justify-end gap-2">
          <ServiceStoreButton type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </ServiceStoreButton>
          <ServiceStoreButton
            type="submit"
            form="store-service-form"
            disabled={isPending}
          >
            {isPending ? "Saving…" : mode === "create" ? "Create service" : "Save changes"}
          </ServiceStoreButton>
        </div>
      }
    >
      <form
        id="store-service-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        {initialValues?.id ? (
          <input type="hidden" name="serviceId" value={initialValues.id} />
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <ServiceStoreFormField id="service-image" label="Service image" error={fieldErrors.image?.[0]}>
          <div className="flex items-start gap-4">
            <div className="relative size-24 overflow-hidden rounded-xl border border-border bg-muted/30">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Service preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }
                setPreviewUrl(URL.createObjectURL(file))
              }}
            />
          </div>
        </ServiceStoreFormField>

        <ServiceStoreFormField
          id="service-name"
          label="Service name"
          error={fieldErrors.name?.[0]}
        >
          <input
            id="service-name"
            name="name"
            required
            className={serviceStoreInputClassName}
            defaultValue={initialValues?.name}
          />
        </ServiceStoreFormField>

        <ServiceStoreFormField
          id="service-description"
          label="Description"
          error={fieldErrors.description?.[0]}
        >
          <textarea
            id="service-description"
            name="description"
            rows={3}
            className={serviceStoreTextareaClassName}
            defaultValue={initialValues?.description}
          />
        </ServiceStoreFormField>

        <div className="grid gap-5 sm:grid-cols-3">
          <ServiceStoreFormField
            id="service-duration"
            label="Duration (minutes)"
            error={fieldErrors.duration?.[0]}
          >
            <input
              id="service-duration"
              name="duration"
              type="number"
              min={5}
              required
              className={serviceStoreInputClassName}
              defaultValue={initialValues?.duration ?? 60}
            />
          </ServiceStoreFormField>

          <ServiceStoreFormField
            id="service-buffer"
            label="Buffer time (minutes)"
            error={fieldErrors.bufferMinutes?.[0]}
          >
            <input
              id="service-buffer"
              name="bufferMinutes"
              type="number"
              min={0}
              max={120}
              required
              className={serviceStoreInputClassName}
              defaultValue={initialValues?.bufferMinutes ?? 0}
            />
          </ServiceStoreFormField>

          <ServiceStoreFormField
            id="service-price"
            label="Price (THB)"
            error={fieldErrors.price?.[0]}
          >
            <input
              id="service-price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              className={serviceStoreInputClassName}
              defaultValue={initialValues?.price}
            />
          </ServiceStoreFormField>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Saving service...
          </div>
        ) : null}
      </form>
    </DetailModalShell>
  )
}
