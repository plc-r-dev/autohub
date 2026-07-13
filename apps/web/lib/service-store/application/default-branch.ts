import { prisma } from "@/lib/prisma"

export async function resolveDefaultBranch(serviceStoreId: string) {
  return prisma.branch.findFirst({
    where: { serviceStoreId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  })
}

export async function requireDefaultBranch(serviceStoreId: string) {
  const branch = await resolveDefaultBranch(serviceStoreId)
  if (!branch) {
    throw new Error("NO_DEFAULT_BRANCH")
  }
  return branch
}
