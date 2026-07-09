import { prisma } from "@/lib/prisma";

export async function listActiveTenants() {
  return prisma.tenant.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function searchMerchants(tenantId: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  return prisma.merchant.findMany({
    where: {
      tenantId,
      OR: [
        { name: { contains: trimmedQuery, mode: "insensitive" } },
        { code: { contains: trimmedQuery, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      phone: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 20,
  });
}
