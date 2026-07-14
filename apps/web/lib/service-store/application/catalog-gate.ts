import { prisma } from "@/lib/prisma"

/**
 * Portal modules (dashboard, bookings, …) unlock only after the store has
 * at least one active service and opening hours with an open day.
 */
export async function isServiceStoreCatalogConfigured(
  serviceStoreId: string,
): Promise<boolean> {
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      branches: {
        select: {
          services: {
            where: { isActive: true },
            select: { id: true },
            take: 1,
          },
          operatingHours: {
            where: { isClosed: false },
            select: { dayOfWeek: true },
            take: 1,
          },
        },
      },
    },
  })

  if (!store || store.branches.length === 0) {
    return false
  }

  const hasService = store.branches.some((branch) => branch.services.length > 0)
  const hasOpenHours = store.branches.some(
    (branch) => branch.operatingHours.length > 0,
  )

  return hasService && hasOpenHours
}
