import { prisma } from "@/lib/prisma";

export async function listPendingMerchantClaims() {
  return prisma.merchantClaim.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      submittedAt: true,
      merchant: {
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

export async function listPendingMerchantOnboardingRequests() {
  return prisma.merchantOnboardingRequest.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      businessName: true,
      businessCode: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      submittedAt: true,
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
