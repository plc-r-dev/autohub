"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { ServiceStoreButton } from "@/components/service-store/ui"
import { cn } from "@workspace/ui/lib/utils"

type StoreImageUploadCardProps = {
  label: string
  description?: string
  imageUrl?: string | null
  aspectClassName?: string
  onUpload: (formData: FormData) => Promise<{ ok: boolean; error?: string }>
  onRemove?: () => Promise<{ ok: boolean; error?: string }>
  allowReplace?: boolean
}

export function StoreImageUploadCard({
  label,
  description,
  imageUrl,
  aspectClassName = "aspect-[4/3]",
  onUpload,
  onRemove,
  allowReplace = true,
}: StoreImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSelect(file: File | undefined) {
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.set("file", file)
    setError(null)

    startTransition(async () => {
      const result = await onUpload(formData)
      if (!result.ok) {
        setError(result.error ?? "Upload failed.")
      }
    })
  }

  function handleRemove() {
    if (!onRemove) {
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await onRemove()
      if (!result.ok) {
        setError(result.error ?? "Remove failed.")
      }
    })
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-muted/30",
          aspectClassName,
        )}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={label}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3">
              {allowReplace ? (
                <ServiceStoreButton
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                  className="h-8 px-3 text-xs"
                >
                  Replace
                </ServiceStoreButton>
              ) : null}
              {onRemove ? (
                <ServiceStoreButton
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={handleRemove}
                  className="h-8 px-3 text-xs text-red-600 dark:text-red-400"
                >
                  <Trash2 className="size-4" />
                </ServiceStoreButton>
              ) : null}
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            Upload image
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          handleSelect(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
