import { prisma } from "@/lib/prisma";
import {
  evaluateOnboardingSetup,
  type OnboardingSetupInput,
  type OnboardingSetupProgress,
} from "@/lib/service-store/domain";

export async function loadOnboardingSetupInput(
  serviceStoreId: string,
): Promise<OnboardingSetupInput | null> {
  const store = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: {
      status: true,
      name: true,
      phone: true,
      email: true,
      businessCategory: true,
      googlePlaceId: true,
      payoutBankName: true,
      payoutAccountName: true,
      payoutAccountNumber: true,
      members: { select: { id: true } },
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
    name: store.name,
    phone: store.phone,
    email: store.email,
    businessCategory: store.businessCategory,
    googlePlaceId: store.googlePlaceId,
    payoutBankName: store.payoutBankName,
    payoutAccountName: store.payoutAccountName,
    payoutAccountNumber: store.payoutAccountNumber,
    branchCount: store.branches.length,
    activeServiceCount,
    branchesWithOpenHoursCount,
    teamInvited: store.members.length > 1,
  };
}

export async function getOnboardingSetupProgress(
  serviceStoreId: string,
): Promise<OnboardingSetupProgress | null> {
  const input = await loadOnboardingSetupInput(serviceStoreId);
  if (!input) {
    return null;
  }
  return evaluateOnboardingSetup(input);
}

export async function getPrimaryBranchId(serviceStoreId: string): Promise<string | null> {
  const branch = await prisma.branch.findFirst({
    where: { serviceStoreId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return branch?.id ?? null;
}
