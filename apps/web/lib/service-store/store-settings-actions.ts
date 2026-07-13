"use server"

import { revalidatePath } from "next/cache"
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { parseTimeToMinutes } from "@/lib/booking/engine/time"
import { branchOperatingHoursSchema } from "@/lib/service-store/schemas"
import { ensureDefaultBranch } from "@/lib/service-store/application/ensure-default-branch"
import {
  slugifyServiceCode,
  storeGeneralSchema,
  storeServiceSchema,
} from "@/lib/service-store/store-settings-schemas"
import {
  removeMediaFile,
  uploadServiceImageFile,
  uploadStoreImageFile,
} from "@/lib/storage/media-upload"
import { prisma } from "@/lib/prisma"

export type StoreSettingsActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function revalidateStoreSettings() {
  revalidatePath("/app/settings")
  revalidatePath("/app/profile")
  revalidatePath("/browse")
}

export async function saveStoreGeneral(
  _prev: StoreSettingsActionResult | null,
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const parsed = storeGeneralSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors, error: "Validation failed." }
  }

  const branch = await ensureDefaultBranch(serviceStore.id, parsed.data.name)

  await prisma.$transaction([
    prisma.serviceStore.update({
      where: { id: serviceStore.id },
      data: parsed.data,
    }),
    prisma.branch.update({
      where: { id: branch.id },
      data: { address: parsed.data.address },
    }),
  ])

  revalidateStoreSettings()
  return { ok: true, message: "Store information saved." }
}

export async function uploadStoreLogo(
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { ok: false, error: "Select an image to upload." }
  }

  try {
    const store = await prisma.serviceStore.findUnique({
      where: { id: serviceStore.id },
      select: { logoKey: true },
    })
    const uploaded = await uploadStoreImageFile({
      serviceStoreId: serviceStore.id,
      kind: "logo",
      file,
    })

    if (store?.logoKey) {
      await removeMediaFile(store.logoKey)
    }

    await prisma.serviceStore.update({
      where: { id: serviceStore.id },
      data: { logoKey: uploaded.key },
    })

    revalidateStoreSettings()
    return { ok: true, message: "Logo uploaded." }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    }
  }
}

export async function uploadStoreCover(
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { ok: false, error: "Select an image to upload." }
  }

  try {
    const store = await prisma.serviceStore.findUnique({
      where: { id: serviceStore.id },
      select: { coverImageKey: true },
    })
    const uploaded = await uploadStoreImageFile({
      serviceStoreId: serviceStore.id,
      kind: "cover",
      file,
    })

    if (store?.coverImageKey) {
      await removeMediaFile(store.coverImageKey)
    }

    await prisma.serviceStore.update({
      where: { id: serviceStore.id },
      data: { coverImageKey: uploaded.key },
    })

    revalidateStoreSettings()
    return { ok: true, message: "Cover image uploaded." }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    }
  }
}

export async function uploadStoreGalleryImage(
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { ok: false, error: "Select an image to upload." }
  }

  try {
    const store = await prisma.serviceStore.findUnique({
      where: { id: serviceStore.id },
      select: { galleryImageKeys: true },
    })
    const uploaded = await uploadStoreImageFile({
      serviceStoreId: serviceStore.id,
      kind: "gallery",
      file,
    })

    await prisma.serviceStore.update({
      where: { id: serviceStore.id },
      data: {
        galleryImageKeys: [...(store?.galleryImageKeys ?? []), uploaded.key],
      },
    })

    revalidateStoreSettings()
    return { ok: true, message: "Photo added." }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    }
  }
}

export async function removeStoreLogo(): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStore.id },
    select: { logoKey: true },
  })

  if (store?.logoKey) {
    await removeMediaFile(store.logoKey)
  }

  await prisma.serviceStore.update({
    where: { id: serviceStore.id },
    data: { logoKey: null },
  })

  revalidateStoreSettings()
  return { ok: true, message: "Logo removed." }
}

export async function removeStoreCover(): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStore.id },
    select: { coverImageKey: true },
  })

  if (store?.coverImageKey) {
    await removeMediaFile(store.coverImageKey)
  }

  await prisma.serviceStore.update({
    where: { id: serviceStore.id },
    data: { coverImageKey: null },
  })

  revalidateStoreSettings()
  return { ok: true, message: "Cover image removed." }
}

export async function removeStoreGalleryImage(
  imageKey: string,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStore.id },
    select: { galleryImageKeys: true },
  })

  if (!store?.galleryImageKeys.includes(imageKey)) {
    return { ok: false, error: "Image not found." }
  }

  await removeMediaFile(imageKey)
  await prisma.serviceStore.update({
    where: { id: serviceStore.id },
    data: {
      galleryImageKeys: store.galleryImageKeys.filter((key) => key !== imageKey),
    },
  })

  revalidateStoreSettings()
  return { ok: true, message: "Photo removed." }
}

export async function saveStoreService(
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const parsed = storeServiceSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors, error: "Validation failed." }
  }

  const branch = await ensureDefaultBranch(serviceStore.id, serviceStore.name)
  const imageFile = formData.get("image")
  const { serviceId, ...data } = parsed.data

  if (serviceId) {
    const existing = await prisma.service.findFirst({
      where: { id: serviceId, branchId: branch.id },
    })

    if (!existing) {
      return { ok: false, error: "Service not found." }
    }

    let imageKey = existing.imageKey
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploaded = await uploadServiceImageFile({
        serviceStoreId: serviceStore.id,
        serviceId: existing.id,
        file: imageFile,
      })
      if (existing.imageKey) {
        await removeMediaFile(existing.imageKey)
      }
      imageKey = uploaded.key
    }

    await prisma.service.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        isActive: data.isActive,
        imageKey,
      },
    })
  } else {
    let code = slugifyServiceCode(data.name)
    const duplicate = await prisma.service.findUnique({
      where: { branchId_code: { branchId: branch.id, code } },
    })
    if (duplicate) {
      code = `${code}-${Date.now()}`
    }

    const created = await prisma.service.create({
      data: {
        branchId: branch.id,
        code,
        name: data.name,
        description: data.description,
        duration: data.duration,
        bufferMinutes: 0,
        price: data.price,
        isActive: data.isActive,
      },
    })

    if (imageFile instanceof File && imageFile.size > 0) {
      const uploaded = await uploadServiceImageFile({
        serviceStoreId: serviceStore.id,
        serviceId: created.id,
        file: imageFile,
      })
      await prisma.service.update({
        where: { id: created.id },
        data: { imageKey: uploaded.key },
      })
    }
  }

  revalidateStoreSettings()
  return { ok: true, message: serviceId ? "Service updated." : "Service created." }
}

export async function deleteStoreService(
  serviceId: string,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const branch = await ensureDefaultBranch(serviceStore.id, serviceStore.name)

  const service = await prisma.service.findFirst({
    where: { id: serviceId, branchId: branch.id },
  })

  if (!service) {
    return { ok: false, error: "Service not found." }
  }

  if (service.imageKey) {
    await removeMediaFile(service.imageKey)
  }

  await prisma.service.delete({ where: { id: service.id } })
  revalidateStoreSettings()
  return { ok: true, message: "Service deleted." }
}

export async function saveStoreHours(
  _prev: StoreSettingsActionResult | null,
  formData: FormData,
): Promise<StoreSettingsActionResult> {
  const { serviceStore } = await requireApprovedServiceStoreUser()
  const branch = await ensureDefaultBranch(serviceStore.id, serviceStore.name)

  const entries = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const prefix = `day-${dayOfWeek}`
    return branchOperatingHoursSchema.safeParse({
      dayOfWeek: String(dayOfWeek),
      openTime: formData.get(`${prefix}-openTime`) ?? "09:00",
      closeTime: formData.get(`${prefix}-closeTime`) ?? "18:00",
      isClosed: formData.get(`${prefix}-isClosed`) ?? "false",
    })
  })

  const fieldErrors: Record<string, string[]> = {}
  const hours = []

  for (const entry of entries) {
    if (!entry.success) {
      Object.assign(fieldErrors, entry.error.flatten().fieldErrors)
      continue
    }

    if (
      !entry.data.isClosed &&
      parseTimeToMinutes(entry.data.openTime) >= parseTimeToMinutes(entry.data.closeTime)
    ) {
      return { ok: false, error: "Opening time must be before closing time." }
    }

    hours.push(entry.data)
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "Validation failed." }
  }

  await prisma.$transaction(
    hours.map((hour) =>
      prisma.branchOperatingHours.upsert({
        where: {
          branchId_dayOfWeek: {
            branchId: branch.id,
            dayOfWeek: hour.dayOfWeek,
          },
        },
        create: {
          branchId: branch.id,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        },
        update: {
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        },
      }),
    ),
  )

  revalidateStoreSettings()
  return { ok: true, message: "Opening hours saved." }
}
