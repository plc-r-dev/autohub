import { prisma } from "@/lib/prisma";

export async function getCustomerForUser(domainUserId: string) {
  return prisma.customer.findUnique({
    where: { userId: domainUserId },
  });
}

export async function requireCustomerForUser(domainUserId: string) {
  const customer = await getCustomerForUser(domainUserId);
  return customer;
}
