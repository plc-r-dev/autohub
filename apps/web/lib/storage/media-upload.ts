import { randomUUID } from "crypto"
import { getStorageProvider } from "@/lib/storage"
import { buildSignedStorageUrl } from "@/lib/storage/signed-url"
import {
  buildStoreMediaKey,
  validateImageUploadFile,
} from "@/lib/storage/validation"
import { deleteStoredFile } from "@/lib/storage/upload-service"

export async function resolveMediaPreviewUrl(key: string | null | undefined) {
  if (!key) {
    return null
  }
  return buildSignedStorageUrl(key, 3600)
}

export async function uploadStoreImageFile(input: {
  serviceStoreId: string
  kind: "logo" | "cover" | "gallery"
  file: File
}) {
  validateImageUploadFile(input.file)

  const slipKey = buildStoreMediaKey(
    input.serviceStoreId,
    input.kind,
    `${randomUUID()}-${input.file.name}`,
  )
  const body = new Uint8Array(await input.file.arrayBuffer())
  const provider = await getStorageProvider()
  const result = await provider.upload({
    key: slipKey,
    body,
    contentType: input.file.type || "image/jpeg",
    fileName: input.file.name,
  })

  return {
    key: result.key,
    previewUrl: await resolveMediaPreviewUrl(result.key),
  }
}

export async function uploadServiceImageFile(input: {
  serviceStoreId: string
  serviceId: string
  file: File
}) {
  validateImageUploadFile(input.file)

  const imageKey = buildStoreMediaKey(
    input.serviceStoreId,
    "service",
    `${randomUUID()}-${input.file.name}`,
    input.serviceId,
  )
  const body = new Uint8Array(await input.file.arrayBuffer())
  const provider = await getStorageProvider()
  const result = await provider.upload({
    key: imageKey,
    body,
    contentType: input.file.type || "image/jpeg",
    fileName: input.file.name,
  })

  return {
    key: result.key,
    previewUrl: await resolveMediaPreviewUrl(result.key),
  }
}

export async function removeMediaFile(key: string | null | undefined) {
  if (!key) {
    return
  }
  await deleteStoredFile(key)
}
