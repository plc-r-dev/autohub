import { prisma } from "@/lib/prisma";
import {
  sendBookingCancelled,
  sendPendingBookingAutoCancelled,
} from "@/lib/line/line-notification-service";

type ExpiredPendingBooking = {
  bookingNumber: string;
  bookingDate: Date;
  customer: { lineUserId: string | null };
  branch: {
    serviceStoreId: string;
    serviceStore: { name: string };
  };
};

export async function runPendingBookingExpirationService(now = new Date()) {
  const expiredPending = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      bookingDate: { lt: now },
    },
    select: {
      bookingNumber: true,
      bookingDate: true,
      customer: { select: { lineUserId: true } },
      branch: {
        select: {
          serviceStoreId: true,
          serviceStore: { select: { name: true } },
        },
      },
    },
    take: 2000,
  });

  if (expiredPending.length === 0) {
    return { cancelledCount: 0 };
  }

  const bookingNumbers = expiredPending.map((booking) => booking.bookingNumber);

  // Cancellation is the primary responsibility of this job. This write is
  // re-guarded by status: "PENDING" so a booking that got confirmed between
  // the find above and this update is left untouched — only bookings still
  // PENDING at the moment of the write are cancelled.
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

  // Notifications are best-effort and must never affect the outcome of this
  // job. Cancellation has already happened above; nothing past this point
  // is allowed to make the job report FAILED.
  try {
    await notifyAutoCancelledBookings(expiredPending, bookingNumbers, now);
  } catch (error) {
    console.error("[pending-booking-expiration] notification stage failed", error);
  }

  return { cancelledCount: updateResult.count };
}

/**
 * Notifies the customer and the service store for every booking that this
 * run actually cancelled. Re-checks which bookings are CANCELLED with
 * cancelledAt === now (rather than trusting the original candidate list)
 * so a booking that was confirmed in the race window above — and therefore
 * left PENDING by the re-guarded updateMany — is not incorrectly notified
 * as cancelled.
 */
async function notifyAutoCancelledBookings(
  candidates: ExpiredPendingBooking[],
  candidateBookingNumbers: string[],
  now: Date,
) {
  const actuallyCancelled = await prisma.booking.findMany({
    where: {
      bookingNumber: { in: candidateBookingNumbers },
      status: "CANCELLED",
      cancelledAt: now,
    },
    select: { bookingNumber: true },
  });
  const cancelledNumbers = new Set(actuallyCancelled.map((booking) => booking.bookingNumber));
  const toNotify = candidates.filter((booking) => cancelledNumbers.has(booking.bookingNumber));
  if (toNotify.length === 0) {
    return;
  }

  const serviceStoreIds = Array.from(
    new Set(toNotify.map((booking) => booking.branch.serviceStoreId)),
  );
  const storeUsers = await prisma.user.findMany({
    where: {
      serviceStoreId: { in: serviceStoreIds },
      lineUserId: { not: null },
    },
    select: { serviceStoreId: true, lineUserId: true },
  });
  const storeRecipientsByServiceStoreId = new Map<string, string[]>();
  for (const user of storeUsers) {
    if (!user.serviceStoreId || !user.lineUserId) {
      continue;
    }
    const recipients = storeRecipientsByServiceStoreId.get(user.serviceStoreId) ?? [];
    recipients.push(user.lineUserId);
    storeRecipientsByServiceStoreId.set(user.serviceStoreId, recipients);
  }

  for (const booking of toNotify) {
    try {
      await sendBookingCancelled({
        recipientLineUserId: booking.customer.lineUserId,
        bookingNumber: booking.bookingNumber,
        serviceStoreName: booking.branch.serviceStore.name,
        bookingDate: booking.bookingDate,
        status: "CANCELLED",
      });
    } catch (error) {
      console.error(
        "[pending-booking-expiration] customer notification failed",
        booking.bookingNumber,
        error,
      );
    }

    const storeRecipients = storeRecipientsByServiceStoreId.get(booking.branch.serviceStoreId) ?? [];
    for (const lineUserId of storeRecipients) {
      try {
        await sendPendingBookingAutoCancelled({
          recipientLineUserId: lineUserId,
          bookingNumber: booking.bookingNumber,
          serviceStoreName: booking.branch.serviceStore.name,
          bookingDate: booking.bookingDate,
          status: "CANCELLED",
        });
      } catch (error) {
        console.error(
          "[pending-booking-expiration] service store notification failed",
          booking.bookingNumber,
          error,
        );
      }
    }
  }
}
