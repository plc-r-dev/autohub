"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Trash2 } from "lucide-react"
import { ServiceStoreButton } from "@/components/service-store/ui"
import { cn } from "@workspace/ui/lib/utils"

type StoreImageUploadCardProps = {
  label: string
  description?: string
  imageUrl?: string | null
  aspectClassName?: string
  compact?: boolean
  deferUpload?: boolean
  inputName?: string
  removed?: boolean
  onFileSelect?: (file: File | null) => void
  onMarkRemove?: () => void
  onUpload?: (formData: FormData) => Promise<{ ok: boolean; error?: string }>
  onRemove?: () => Promise<{ ok: boolean; error?: string }>
  allowReplace?: boolean
}

export function StoreImageUploadCard({
  label,
  description,
  imageUrl,
  aspectClassName = "aspect-[4/3]",
  compact = false,
  deferUpload = false,
  inputName,
  removed = false,
  onFileSelect,
  onMarkRemove,
  onUpload,
  onRemove,
  allowReplace = true,
}: StoreImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const displayUrl = removed ? null : localPreview ?? imageUrl ?? null

  function clearLocalPreview() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
  }

  function handleSelect(file: File | undefined) {
    if (!file) {
      return
    }

    setError(null)

    if (deferUpload) {
      clearLocalPreview()
      setLocalPreview(URL.createObjectURL(file))
      onFileSelect?.(file)
      return
    }

    if (!onUpload) {
      return
    }

    const formData = new FormData()
    formData.set("file", file)
    setIsPending(true)

    void onUpload(formData).then((result) => {
      if (!result.ok) {
        setError(result.error ?? "Upload failed.")
      }
      setIsPending(false)
    })
  }

  function handleRemove() {
    setError(null)

    if (deferUpload) {
      clearLocalPreview()
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      onFileSelect?.(null)
      onMarkRemove?.()
      return
    }

    if (!onRemove) {
      return
    }

    setIsPending(true)
    void onRemove().then((result) => {
      if (!result.ok) {
        setError(result.error ?? "Remove failed.")
      }
      setIsPending(false)
    })
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-0")}>
      {!compact ? (
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "relative overflow-hidden border border-border bg-muted/30",
          compact ? "aspect-square rounded-lg" : cn("rounded-2xl", aspectClassName),
        )}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt={label}
              fill
              unoptimized
              className="object-cover"
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/50 to-transparent",
                compact ? "gap-1 p-1" : "gap-2 p-3",
              )}
            >
              {allowReplace ? (
                <ServiceStoreButton
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "text-xs",
                    compact ? "h-6 px-2" : "h-8 px-3",
                  )}
                >
                  Replace
                </ServiceStoreButton>
              ) : null}
              {onRemove || onMarkRemove ? (
                <ServiceStoreButton
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={handleRemove}
                  className={cn(
                    "text-xs text-red-600 dark:text-red-400",
                    compact ? "h-6 px-1.5" : "h-8 px-3",
                  )}
                >
                  <Trash2 className={compact ? "size-3" : "size-4"} />
                </ServiceStoreButton>
              ) : null}
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex size-full flex-col items-center justify-center text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
              compact ? "gap-1 text-[10px]" : "gap-2 text-sm",
            )}
          >
            <ImagePlus className={compact ? "size-3.5" : "size-5"} />
            {compact ? "Add" : "Upload image"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={deferUpload ? inputName : undefined}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          handleSelect(event.target.files?.[0])
          if (!deferUpload) {
            event.target.value = ""
          }
        }}
      />

      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
