import { prisma } from "@/lib/prisma";
import type { ServiceCatalogBranch } from "@/lib/service-store/domain/service-catalog";

/** Active branch services — same source as the Services menu (`/app/branches/[id]/services`). */
export async function getServiceStoreServiceCatalog(
  serviceStoreId: string,
): Promise<ServiceCatalogBranch[]> {
  const branches = await prisma.branch.findMany({
    where: { serviceStoreId },
    select: {
      id: true,
      name: true,
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
    orderBy: { name: "asc" },
  });

  return branches
    .filter((branch) => branch.services.length > 0)
    .map((branch) => ({
      id: branch.id,
      name: branch.name,
      services: branch.services.map((service) => ({
        id: service.id,
        code: service.code,
        name: service.name,
        duration: service.duration,
        bufferMinutes: service.bufferMinutes,
        price: service.price.toString(),
      })),
    }));
}
