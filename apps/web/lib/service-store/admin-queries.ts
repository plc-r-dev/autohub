import { prisma } from "@/lib/prisma"
import type { ServiceStoreStatus } from "@/lib/generated/prisma/client"

export type AdminServiceStoreListParams = {
  q?: string
  status?: ServiceStoreStatus | "ALL"
}

export async function getAdminServiceStores(
  params: AdminServiceStoreListParams = {},
) {
  const keyword = params.q?.trim()
  const status =
    params.status && params.status !== "ALL" ? params.status : undefined

  return prisma.serviceStore.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { code: { contains: keyword, mode: "insensitive" } },
              { phone: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      bookingEnabled: true,
      phone: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          branches: true,
          members: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  })
}

export async function getAdminServiceStoreDetail(serviceStoreId: string) {
  return prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      bookingEnabled: true,
      phone: true,
      email: true,
      website: true,
      description: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      branches: {
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      },
      members: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  })
}
