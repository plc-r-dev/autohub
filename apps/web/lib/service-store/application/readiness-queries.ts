import { prisma } from "@/lib/prisma";
import {
  evaluateServiceStoreReadiness,
  type ReadinessInput,
  type ServiceStoreReadiness,
} from "@/lib/service-store/domain";

export async function getServiceStoreReadiness(
  serviceStoreId: string,
): Promise<ServiceStoreReadiness | null> {
  const input = await loadReadinessInput(serviceStoreId);
  if (!input) {
    return null;
  }
  return evaluateServiceStoreReadiness(input);
}

export async function loadReadinessInput(
  serviceStoreId: string,
): Promise<ReadinessInput | null> {
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      status: true,
      phone: true,
      email: true,
      businessCategory: true,
      payoutBankName: true,
      payoutAccountName: true,
      payoutAccountNumber: true,
      members: {
        where: { role: "OWNER" },
        select: { id: true },
      },
      branches: {
        select: {
          id: true,
          services: {
            where: { isActive: true },
            select: { id: true },
          },
          operatingHours: {
            select: { isClosed: true },
          },
        },
      },
    },
  });

  if (!store) {
    return null;
  }

  const branchesWithServices = store.branches.filter((branch) => branch.services.length > 0);
  const activeServiceCount = branchesWithServices.reduce(
    (total, branch) => total + branch.services.length,
    0,
  );
  const branchesWithOpenHoursCount = store.branches.filter((branch) =>
    branch.operatingHours.some((hour) => !hour.isClosed),
  ).length;

  return {
    status: store.status,
    ownerCount: store.members.length,
    branchCount: store.branches.length,
    activeServiceCount,
    branchesWithOpenHoursCount,
    hasContactInfo: Boolean(store.phone?.trim() || store.email?.trim()),
    hasPaymentAccount: Boolean(
      store.payoutBankName?.trim() &&
        store.payoutAccountName?.trim() &&
        store.payoutAccountNumber?.trim(),
    ),
    hasBusinessCategory: Boolean(store.businessCategory?.trim()),
  };
}
