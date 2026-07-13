import { prisma } from "@/lib/prisma";

export type NewBookingCustomerLookup = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  linePictureUrl: string | null;
  vehicles: Array<{
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  }>;
};

export async function lookupCustomerByPhone(
  serviceStoreId: string,
  phone: string,
): Promise<NewBookingCustomerLookup | null> {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return null;
  }

  const serviceStore = await prisma.serviceStore.findUnique({
    where: { id: serviceStoreId },
    select: { tenantId: true },
  });

  if (!serviceStore) {
    return null;
  }

  return prisma.customer.findFirst({
    where: {
      tenantId: serviceStore.tenantId,
      phone: normalizedPhone,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      linePictureUrl: true,
      vehicles: {
        select: {
          id: true,
          licensePlate: true,
          brand: true,
          model: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ isWalkIn: "asc" }],
  });
}

export async function lookupVehicleByPlate(
  customerId: string,
  licensePlate: string,
) {
  const normalizedPlate = licensePlate.trim();
  if (!customerId || !normalizedPlate) {
    return null;
  }

  return prisma.vehicle.findFirst({
    where: {
      customerId,
      licensePlate: { equals: normalizedPlate, mode: "insensitive" },
    },
    select: {
      id: true,
      licensePlate: true,
      brand: true,
      model: true,
    },
  });
}
