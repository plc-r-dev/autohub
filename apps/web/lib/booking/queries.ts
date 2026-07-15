import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/client";

const bookingListSelect = {
  bookingNumber: true,
  status: true,
  bookingDate: true,
  source: true,
  confirmedAt: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  noShowAt: true,
  customer: {
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      isWalkIn: true,
      linePictureUrl: true,
    },
  },
  vehicle: {
    select: { licensePlate: true, brand: true, model: true, province: true },
  },
  branch: { select: { name: true } },
  items: {
    select: {
      service: { select: { name: true } },
    },
  },
} as const;

const customerBookingServiceStoreSelect = {
  id: true,
  name: true,
  logoKey: true,
  coverImageKey: true,
  galleryImageKeys: true,
} as const;

export async function getCustomerBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    select: {
      ...bookingListSelect,
      branch: {
        select: {
          name: true,
          serviceStore: { select: customerBookingServiceStoreSelect },
        },
      },
    },
    orderBy: { bookingDate: "desc" },
  });
}

type CustomerBookingListParams = {
  q?: string;
  status?: BookingStatus;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function getCustomerBookingsPaginated(
  customerId: string,
  params: CustomerBookingListParams,
) {
  const keyword = params.q?.trim();
  const where = {
    customerId,
    ...(params.status ? { status: params.status } : {}),
    ...(keyword
      ? {
          OR: [
            { bookingNumber: { contains: keyword, mode: "insensitive" as const } },
            { branch: { name: { contains: keyword, mode: "insensitive" as const } } },
            {
              branch: {
                serviceStore: { name: { contains: keyword, mode: "insensitive" as const } },
              },
            },
            { vehicle: { licensePlate: { contains: keyword, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      select: {
        ...bookingListSelect,
        branch: {
          select: {
            name: true,
            serviceStore: { select: customerBookingServiceStoreSelect },
          },
        },
      },
      orderBy: { bookingDate: params.sort },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getCustomerBooking(
  bookingNumber: string,
  customerId: string,
) {
  return prisma.booking.findFirst({
    where: { bookingNumber, customerId },
    include: {
      branch: {
        select: {
          name: true,
          address: true,
          serviceStore: { select: { name: true, phone: true } },
        },
      },
      vehicle: true,
      items: {
        include: {
          service: { select: { name: true, duration: true } },
        },
      },
    },
  });
}

export async function getServiceStoreBookings(serviceStoreId: string) {
  return prisma.booking.findMany({
    where: {
      branch: { serviceStoreId },
    },
    select: bookingListSelect,
    orderBy: { bookingDate: "desc" },
  });
}

type ServiceStoreBookingListParams = {
  q?: string;
  status?: BookingStatus;
  branchId?: string;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
  sort: "asc" | "desc";
};

export async function getServiceStoreBookingsPaginated(
  serviceStoreId: string,
  params: ServiceStoreBookingListParams,
) {
  const keyword = params.q?.trim();
  const where = {
    branch: {
      serviceStoreId,
      ...(params.branchId ? { id: params.branchId } : {}),
    },
    ...(params.status ? { status: params.status } : {}),
    ...(params.from || params.to
      ? {
          bookingDate: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            { bookingNumber: { contains: keyword, mode: "insensitive" as const } },
            { customer: { firstName: { contains: keyword, mode: "insensitive" as const } } },
            { customer: { lastName: { contains: keyword, mode: "insensitive" as const } } },
            { vehicle: { licensePlate: { contains: keyword, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      select: bookingListSelect,
      orderBy: { bookingDate: params.sort },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalCount, rows };
}

export async function getServiceStoreBooking(
  bookingNumber: string,
  serviceStoreId: string,
) {
  return prisma.booking.findFirst({
    where: {
      bookingNumber,
      branch: { serviceStoreId },
    },
    include: {
      customer: true,
      vehicle: true,
      branch: { select: { name: true, address: true } },
      items: {
        include: {
          service: { select: { name: true, duration: true, price: true } },
        },
      },
    },
  });
}

export function getTodayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getServiceStoreTodaysBookings(serviceStoreId: string) {
  const { start, end } = getTodayBounds();

  return prisma.booking.findMany({
    where: {
      branch: { serviceStoreId },
      bookingDate: {
        gte: start,
        lte: end,
      },
    },
    select: bookingListSelect,
    orderBy: { bookingDate: "asc" },
  });
}

export function groupBookingsByStatus<T extends { status: BookingStatus }>(
  bookings: T[],
): Record<BookingStatus, T[]> {
  const groups: Record<BookingStatus, T[]> = {
    PENDING: [],
    CONFIRMED: [],
    CHECKED_IN: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

  for (const booking of bookings) {
    groups[booking.status].push(booking);
  }

  return groups;
}
