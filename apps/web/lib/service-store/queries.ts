import { prisma } from "@/lib/prisma";

export async function listPendingServiceStoreClaims() {
  return prisma.serviceStoreClaim.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      submittedAt: true,
      citizenIdFileName: true,
      citizenIdKey: true,
      companyDocumentFileName: true,
      companyDocumentKey: true,
      serviceStore: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          tenant: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          tenant: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}

export async function listPendingServiceStoreOnboardingRequests() {
  return prisma.serviceStoreOnboardingRequest.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      businessName: true,
      businessCode: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      address: true,
      submittedAt: true,
      citizenIdFileName: true,
      citizenIdKey: true,
      companyDocumentFileName: true,
      companyDocumentKey: true,
      tenant: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}
