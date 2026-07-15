"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/lib/generated/prisma/client"
import { requireAdminSession } from "@/lib/auth/require-admin"
import { PLATFORM_SETTINGS_ID } from "@/lib/platform-settings/queries"
import {
  billingSettingsSchema,
  companySettingsSchema,
  paymentSettingsSchema,
  storageSettingsSchema,
  systemSettingsSchema,
} from "@/lib/platform-settings/schemas"
import { prisma } from "@/lib/prisma"
import { getStorageProvider } from "@/lib/storage"
import { resolveMediaPreviewUrl } from "@/lib/storage/media-upload"
import { validateImageUploadFile } from "@/lib/storage/validation"

export type PlatformSettingsActionState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string[]>
}

export type PlatformSettingsSection =
  | "billing"
  | "company"
  | "payment"
  | "storage"
  | "system"

function formDataToObject(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      entries[key] = value
    }
  }
  return entries
}

function revalidateSettingsPaths() {
  revalidatePath("/admin/settings")
  revalidatePath("/admin/settings/platform")
  revalidatePath("/admin/settings/general")
  revalidatePath("/admin/billings")
}

async function assertAdmin() {
  try {
    await requireAdminSession()
    return true
  } catch {
    return false
  }
}

async function uploadPlatformImage(
  kind: "logo" | "promptpay",
  file: File | null,
): Promise<string | undefined> {
  if (!file || file.size <= 0) return undefined
  validateImageUploadFile(file)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const key = `platform/${kind}/${randomUUID()}-${safeName}`
  const body = new Uint8Array(await file.arrayBuffer())
  const provider = await getStorageProvider()
  const result = await provider.upload({
    key,
    body,
    contentType: file.type || "image/jpeg",
    fileName: file.name,
  })
  return result.key
}

export async function updatePlatformSettingsSection(
  section: PlatformSettingsSection,
  _prev: PlatformSettingsActionState,
  formData: FormData,
): Promise<PlatformSettingsActionState> {
  if (!(await assertAdmin())) {
    return { error: "Unauthorized." }
  }

  const fields = formDataToObject(formData)

  try {
    if (section === "billing") {
      const parsed = billingSettingsSchema.safeParse(fields)
      if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors }
      }
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: {
          bookingFee: new Prisma.Decimal(parsed.data.bookingFee),
          vatRate: new Prisma.Decimal(parsed.data.vatRate),
          currency: parsed.data.currency,
          billingDueDays: parsed.data.billingDueDays,
        },
      })
    }

    if (section === "company") {
      const parsed = companySettingsSchema.safeParse(fields)
      if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors }
      }
      const logoKey = await uploadPlatformImage(
        "logo",
        formData.get("companyLogo") as File | null,
      )
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: {
          companyName: parsed.data.companyName,
          taxId: parsed.data.taxId,
          address: parsed.data.address,
          ...(logoKey ? { companyLogoKey: logoKey } : {}),
        },
      })
    }

    if (section === "payment") {
      const parsed = paymentSettingsSchema.safeParse(fields)
      if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors }
      }
      const qrKey = await uploadPlatformImage(
        "promptpay",
        formData.get("promptPayQr") as File | null,
      )
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: {
          bankName: parsed.data.bankName,
          accountName: parsed.data.accountName,
          accountNumber: parsed.data.accountNumber,
          bankBranch: parsed.data.bankBranch,
          ...(qrKey ? { promptPayQrKey: qrKey } : {}),
        },
      })
    }

    if (section === "storage") {
      const parsed = storageSettingsSchema.safeParse(fields)
      if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors }
      }
      const bucketName =
        parsed.data.storageProvider === "local"
          ? parsed.data.bucketName || "autohub-uploads"
          : parsed.data.bucketName
      if (parsed.data.storageProvider !== "local" && !bucketName.trim()) {
        return {
          fieldErrors: { bucketName: ["Bucket / container name is required."] },
        }
      }
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: {
          storageProvider: parsed.data.storageProvider,
          bucketName,
          storageRegion: parsed.data.storageRegion,
        },
      })
    }

    if (section === "system") {
      const parsed = systemSettingsSchema.safeParse(fields)
      if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors }
      }
      await prisma.platformSettings.update({
        where: { id: PLATFORM_SETTINGS_ID },
        data: {
          timeZone: parsed.data.timeZone,
          language: parsed.data.language,
          currency: parsed.data.currency,
          dateFormat: parsed.data.dateFormat,
          timeFormat: parsed.data.timeFormat,
        },
      })
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save platform settings.",
    }
  }

  revalidateSettingsPaths()
  return { success: "Settings saved." }
}

export async function getPlatformMediaPreviewUrls(input: {
  companyLogoKey?: string | null
  promptPayQrKey?: string | null
}) {
  return {
    companyLogoUrl: await resolveMediaPreviewUrl(input.companyLogoKey),
    promptPayQrUrl: await resolveMediaPreviewUrl(input.promptPayQrKey),
  }
}
