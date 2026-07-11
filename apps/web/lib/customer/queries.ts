import { prisma } from "@/lib/prisma";

export async function searchServiceStoreCustomers(
  serviceStoreId: string,
  search?: string,
) {
  const keyword = search?.trim();
  const where = keyword
    ? {
        OR: [
          { firstName: { contains: keyword, mode: "insensitive" as const } },
          { lastName: { contains: keyword, mode: "insensitive" as const } },
          { phone: { contains: keyword, mode: "insensitive" as const } },
          {
            vehicles: {
              some: {
                licensePlate: { contains: keyword, mode: "insensitive" as const },
              },
            },
          },
        ],
      }
    : undefined;

  return prisma.customer.findMany({
    where: {
      ...where,
      bookings: {
        some: {
          branch: { serviceStoreId },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      lineDisplayName: true,
      vehicles: {
        select: { id: true, licensePlate: true, brand: true, model: true },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          bookings: {
            where: {
              branch: { serviceStoreId },
            },
          },
        },
      },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

type ServiceStoreCustomerListParams = {
  q?: string;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function searchServiceStoreCustomersPaginated(
  serviceStoreId: string,
  params: ServiceStoreCustomerListParams,
) {
  const keyword = params.q?.trim();
  const keywordWhere = keyword
    ? {
        OR: [
          { firstName: { contains: keyword, mode: "insensitive" as const } },
          { lastName: { contains: keyword, mode: "insensitive" as const } },
          { phone: { contains: keyword, mode: "insensitive" as const } },
          {
            vehicles: {
              some: {
                licensePlate: { contains: keyword, mode: "insensitive" as const },
              },
            },
          },
        ],
      }
    : {};

  const where = {
    ...keywordWhere,
    bookings: {
      some: {
        branch: { serviceStoreId },
      },
    },
  };

  const [totalCount, rows] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        vehicles: {
          select: { licensePlate: true, brand: true, model: true },
          orderBy: { createdAt: "asc" },
          take: 3,
        },
        _count: {
          select: {
            bookings: {
              where: { branch: { serviceStoreId } },
            },
          },
        },
      },
      orderBy: [{ firstName: params.sort }, { lastName: params.sort }],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getServiceStoreCustomerDetail(
  serviceStoreId: string,
  customerId: string,
) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      bookings: {
        some: {
          branch: { serviceStoreId },
        },
      },
    },
    include: {
      vehicles: {
        orderBy: { createdAt: "asc" },
      },
      bookings: {
        where: { branch: { serviceStoreId } },
        include: {
          vehicle: true,
          items: {
            include: {
              service: { select: { name: true } },
            },
          },
        },
        orderBy: { bookingDate: "desc" },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const completedBookings = customer.bookings.filter(
    (booking) => booking.status === "COMPLETED",
  );

  const totalVisits = completedBookings.length;
  const totalSpending = completedBookings.reduce((total, booking) => {
    const bookingTotal = booking.items.reduce(
      (itemsTotal, item) => itemsTotal + Number(item.unitPrice) * item.quantity,
      0,
    );
    return total + bookingTotal;
  }, 0);
  const lastVisit = completedBookings[0]?.bookingDate ?? null;

  const serviceCounts = new Map<string, { name: string; count: number }>();
  for (const booking of completedBookings) {
    for (const item of booking.items) {
      const existing = serviceCounts.get(item.serviceId);
      if (existing) {
        existing.count += item.quantity;
      } else {
        serviceCounts.set(item.serviceId, {
          name: item.service.name,
          count: item.quantity,
        });
      }
    }
  }
  const favoriteServices = [...serviceCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    customer,
    metrics: {
      totalVisits,
      totalSpending,
      lastVisit,
      favoriteServices,
    },
  };
}

export async function getServiceStoreVehicleDetail(
  serviceStoreId: string,
  customerId: string,
  vehicleId: string,
) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      customerId,
      customer: {
        bookings: {
          some: {
            branch: { serviceStoreId },
          },
        },
      },
    },
    include: {
      customer: true,
      bookings: {
        where: { branch: { serviceStoreId } },
        include: {
          items: {
            include: { service: { select: { name: true } } },
          },
        },
        orderBy: { bookingDate: "desc" },
      },
    },
  });

  if (!vehicle) {
    return null;
  }

  const completed = vehicle.bookings.filter((booking) => booking.status === "COMPLETED");
  const totalSpending = completed.reduce((total, booking) => {
    const bookingTotal = booking.items.reduce(
      (itemsTotal, item) => itemsTotal + Number(item.unitPrice) * item.quantity,
      0,
    );
    return total + bookingTotal;
  }, 0);
  const lastWashDate = completed[0]?.bookingDate ?? null;

  const serviceCounts = new Map<string, { name: string; count: number }>();
  for (const booking of completed) {
    for (const item of booking.items) {
      const current = serviceCounts.get(item.serviceId);
      if (current) {
        current.count += item.quantity;
      } else {
        serviceCounts.set(item.serviceId, {
          name: item.service.name,
          count: item.quantity,
        });
      }
    }
  }

  return {
    vehicle,
    metrics: {
      totalSpending,
      lastWashDate,
      servicesReceived: [...serviceCounts.values()].sort((a, b) => b.count - a.count),
    },
  };
}
