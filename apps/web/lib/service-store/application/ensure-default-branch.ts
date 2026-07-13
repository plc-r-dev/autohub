import { getDefaultOperatingHours } from "@/lib/booking/engine/time"
import { prisma } from "@/lib/prisma"
import { resolveDefaultBranch } from "@/lib/service-store/application/default-branch"

export async function ensureDefaultBranch(
  serviceStoreId: string,
  serviceStoreName: string,
) {
  const existing = await resolveDefaultBranch(serviceStoreId)
  if (existing) {
    return existing
  }

  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        serviceStoreId,
        code: "main",
        name: serviceStoreName,
        slotIntervalMinutes: 15,
        concurrentCapacity: 1,
      },
      select: { id: true, name: true },
    })

    await tx.branchOperatingHours.createMany({
      data: getDefaultOperatingHours().map((hours) => ({
        branchId: branch.id,
        ...hours,
      })),
    })

    return branch
  })
}
