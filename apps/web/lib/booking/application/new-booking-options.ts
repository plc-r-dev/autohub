import { getServiceStoreServiceCatalog } from "@/lib/service-store/application/service-catalog-queries";
import type { ServiceCatalogBranch } from "@/lib/service-store/domain/service-catalog";

export type NewBookingFormOptions = {
  branches: ServiceCatalogBranch[];
  defaultBranchId: string | null;
};

export async function getNewBookingFormOptions(
  serviceStoreId: string,
): Promise<NewBookingFormOptions> {
  const branches = await getServiceStoreServiceCatalog(serviceStoreId);

  return {
    branches,
    defaultBranchId: branches.length === 1 ? branches[0]!.id : null,
  };
}
