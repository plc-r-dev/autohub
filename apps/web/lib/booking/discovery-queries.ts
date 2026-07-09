import { prisma } from "@/lib/prisma";

const marketplaceMerchantWhere = {
  status: "ACTIVE" as const,
  branches: {
    some: {
      services: {
        some: {
          isActive: true,
        },
      },
    },
  },
};

export async function listBrowseMerchants() {
  return prisma.merchant.findMany({
    where: marketplaceMerchantWhere,
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      phone: true,
      email: true,
      tenant: {
        select: { name: true, code: true },
      },
      branches: {
        where: {
          services: { some: { isActive: true } },
        },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

type BrowseMerchantListParams = {
  q?: string;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function listBrowseMerchantsPaginated(params: BrowseMerchantListParams) {
  const keyword = params.q?.trim();
  const where = {
    ...marketplaceMerchantWhere,
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" as const } },
            { code: { contains: keyword, mode: "insensitive" as const } },
            { tenant: { name: { contains: keyword, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.merchant.count({ where }),
    prisma.merchant.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        tenant: { select: { name: true } },
        _count: {
          select: {
            branches: {
              where: { services: { some: { isActive: true } } },
            },
          },
        },
      },
      orderBy: { name: params.sort },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getBrowseMerchant(merchantId: string) {
  return prisma.merchant.findFirst({
    where: {
      id: merchantId,
      ...marketplaceMerchantWhere,
    },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      tenant: {
        select: { name: true, code: true },
      },
      branches: {
        where: {
          services: { some: { isActive: true } },
        },
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          address: true,
          services: {
            where: { isActive: true },
            select: { id: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getBrowseBranch(merchantId: string, branchId: string) {
  return prisma.branch.findFirst({
    where: {
      id: branchId,
      merchantId,
      merchant: marketplaceMerchantWhere,
      services: { some: { isActive: true } },
    },
    select: {
      id: true,
      code: true,
      name: true,
      phone: true,
      address: true,
      merchant: {
        select: { id: true, name: true, code: true },
      },
      services: {
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          duration: true,
          bufferMinutes: true,
          price: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });
}
