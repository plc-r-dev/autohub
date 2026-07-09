import { prisma } from "@/lib/prisma";

export async function runPendingBookingExpirationService(now = new Date()) {
  const expiredPending = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      bookingDate: { lt: now },
    },
    select: { bookingNumber: true },
    take: 2000,
  });

  if (expiredPending.length === 0) {
    return { cancelledCount: 0 };
  }

  const bookingNumbers = expiredPending.map((booking) => booking.bookingNumber);
  const updateResult = await prisma.booking.updateMany({
    where: {
      bookingNumber: { in: bookingNumbers },
      status: "PENDING",
    },
    data: {
      status: "CANCELLED",
      cancelledAt: now,
    },
  });

  return { cancelledCount: updateResult.count };
}
