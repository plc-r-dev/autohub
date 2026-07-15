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
  /** Render label + upload/remove buttons only (no preview tile). */
  buttonOnly?: boolean
  multiple?: boolean
  deferUpload?: boolean
  inputName?: string
  removed?: boolean
  onFileSelect?: (file: File | null) => void
  onFilesSelect?: (files: File[]) => void
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
  buttonOnly = false,
  multiple = false,
  deferUpload = false,
  inputName,
  removed = false,
  onFileSelect,
  onFilesSelect,
  onMarkRemove,
  onUpload,
  onRemove,
  allowReplace = true,
}: StoreImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const displayUrl = removed ? null : localPreview ?? imageUrl ?? null
  const hasImage = Boolean(displayUrl)

  function clearLocalPreview() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
  }

  function handleSelect(files: FileList | null) {
    const selected = files ? Array.from(files) : []
    if (selected.length === 0) {
      return
    }

    setError(null)

    if (multiple && deferUpload && onFilesSelect) {
      onFilesSelect(selected)
      return
    }

    const file = selected[0]
    if (!file) {
      return
    }

    if (deferUpload) {
      clearLocalPreview()
      setLocalPreview(URL.createObjectURL(file))
      setSelectedFileName(file.name)
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
      setSelectedFileName(null)
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

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      name={deferUpload && !multiple ? inputName : undefined}
      accept="image/jpeg,image/png,image/webp"
      multiple={multiple}
      className="hidden"
      onChange={(event) => {
        const files = event.target.files
        handleSelect(files)
        // Keep the file on named defer-upload inputs so form submit includes it.
        // Clear only for multi-select / immediate-upload flows.
        if (multiple || !deferUpload || !inputName) {
          event.target.value = ""
        }
      }}
    />
  )

  if (buttonOnly) {
    return (
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ServiceStoreButton
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="h-9 gap-2 px-3 text-xs"
          >
            <ImagePlus className="size-4" />
            {hasImage ? "Replace cover" : "Upload cover"}
          </ServiceStoreButton>
          {hasImage && (onRemove || onMarkRemove) ? (
            <ServiceStoreButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={handleRemove}
              className="h-9 px-3 text-xs text-red-600 dark:text-red-400"
            >
              <Trash2 className="size-4" />
              Remove
            </ServiceStoreButton>
          ) : null}
          {hasImage ? (
            <span className="truncate text-xs text-muted-foreground">
              {selectedFileName ?? "Cover photo set"}
            </span>
          ) : null}
        </div>

        {fileInput}
        {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    )
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

      {fileInput}
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  )
}
