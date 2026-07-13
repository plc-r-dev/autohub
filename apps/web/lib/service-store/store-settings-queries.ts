import { getDefaultOperatingHours } from "@/lib/booking/engine/time"
import { prisma } from "@/lib/prisma"
import { resolveMediaPreviewUrl } from "@/lib/storage/media-upload"
import { ensureDefaultBranch } from "@/lib/service-store/application/ensure-default-branch"
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params"

export type StoreSettingsGeneral = {
  name: string
  description: string
  phone: string
  email: string
  address: string
  logoUrl: string | null
  coverImageUrl: string | null
  galleryImages: Array<{ key: string; url: string }>
}

export type StoreSettingsServiceRow = {
  id: string
  name: string
  description: string | null
  duration: number
  bufferMinutes: number
  price: string
  imageUrl: string | null
}

export type StoreSettingsHoursDay = {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export type StoreSettingsPageData = {
  branchId: string | null
  general: StoreSettingsGeneral
  services: {
    totalCount: number
    rows: StoreSettingsServiceRow[]
    page: number
    pageSize: number
    hasFilters: boolean
  }
  hours: StoreSettingsHoursDay[]
}

export async function getStoreSettingsPageData(
  serviceStoreId: string,
  serviceStoreName: string,
  searchParams: {
    q?: string
    status?: string
    sort?: string
    page?: string
    pageSize?: string
  },
): Promise<StoreSettingsPageData> {
  const branch = await ensureDefaultBranch(serviceStoreId, serviceStoreName)
  const { page, pageSize, skip } = parseListPaging(searchParams)
  const sort = parseSortOrder(searchParams.sort)
  const keyword = searchParams.q?.trim()

  const serviceStore = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      name: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      logoKey: true,
      coverImageKey: true,
      galleryImageKeys: true,
    },
  })

  if (!serviceStore) {
    throw new Error("Service store not found.")
  }

  const where = {
    branchId: branch.id,
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" as const } },
            { description: { contains: keyword, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [totalCount, serviceRows, operatingHours] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        bufferMinutes: true,
        price: true,
        imageKey: true,
      },
      orderBy: { name: sort },
      skip,
      take: pageSize,
    }),
    prisma.branchOperatingHours.findMany({
      where: { branchId: branch.id },
      orderBy: { dayOfWeek: "asc" },
      select: {
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isClosed: true,
      },
    }),
  ])

  const hoursByDay = new Map(operatingHours.map((hour) => [hour.dayOfWeek, hour]))
  const hours = getDefaultOperatingHours().map((defaultHour) => {
    const existing = hoursByDay.get(defaultHour.dayOfWeek)
    return existing ?? defaultHour
  })

  const galleryImages = await Promise.all(
    serviceStore.galleryImageKeys.map(async (key) => ({
      key,
      url: (await resolveMediaPreviewUrl(key)) ?? "",
    })),
  )

  const rows = await Promise.all(
    serviceRows.map(async (service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      bufferMinutes: service.bufferMinutes,
      price: service.price.toString(),
      imageUrl: await resolveMediaPreviewUrl(service.imageKey),
    })),
  )

  return {
    branchId: branch.id,
    general: {
      name: serviceStore.name,
      description: serviceStore.description ?? "",
      phone: serviceStore.phone ?? "",
      email: serviceStore.email ?? "",
      address: serviceStore.address ?? "",
      logoUrl: await resolveMediaPreviewUrl(serviceStore.logoKey),
      coverImageUrl: await resolveMediaPreviewUrl(serviceStore.coverImageKey),
      galleryImages: galleryImages.filter((image) => image.url),
    },
    services: {
      totalCount,
      rows,
      page,
      pageSize,
      hasFilters: Boolean(keyword),
    },
    hours,
  }
}

export async function getStoreServiceForEdit(
  serviceStoreId: string,
  branchId: string,
  serviceId: string,
) {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      branchId,
      branch: { serviceStoreId },
    },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      bufferMinutes: true,
      price: true,
      imageKey: true,
    },
  })

  if (!service) {
    return null
  }

  return {
    id: service.id,
    name: service.name,
    description: service.description ?? "",
    duration: service.duration,
    bufferMinutes: service.bufferMinutes,
    price: service.price.toString(),
    imageUrl: await resolveMediaPreviewUrl(service.imageKey),
  }
}
