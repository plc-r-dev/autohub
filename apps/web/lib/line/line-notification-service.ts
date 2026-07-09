import { getLineClient } from "@/lib/line/line-client";
import {
  buildBillingMessages,
  buildBookingMessages,
  buildMerchantApprovedMessages,
} from "@/lib/line/message-builder";

export type NotificationSendResult =
  | { status: "SUCCESS"; message: string }
  | { status: "FAILED"; message: string; error?: string }
  | { status: "ERROR"; message: string; error: string };

type BasePayload = {
  event: string;
  recipientLineUserId: string | null | undefined;
};

function logNotification(
  level: "info" | "warn" | "error",
  payload: Record<string, unknown>,
) {
  const timestamp = new Date().toISOString();
  const data = { timestamp, ...payload };
  if (level === "error") {
    console.error("[line-notification]", data);
    return;
  }
  if (level === "warn") {
    console.warn("[line-notification]", data);
    return;
  }
  console.log("[line-notification]", data);
}

async function sendLineMessages(
  payload: BasePayload,
  messages: {
    flex: Record<string, unknown>;
    text: Record<string, unknown>;
  },
): Promise<NotificationSendResult> {
  if (!payload.recipientLineUserId) {
    logNotification("warn", {
      event: payload.event,
      recipient: payload.recipientLineUserId,
      reason: "Recipient LINE user id is missing.",
    });
    return { status: "FAILED", message: "Recipient LINE user id is missing." };
  }

  const client = getLineClient();
  if (!client.isConfigured()) {
    logNotification("warn", {
      event: payload.event,
      recipient: payload.recipientLineUserId,
      reason: "LINE configuration is missing.",
    });
    return { status: "FAILED", message: "LINE configuration is missing." };
  }

  try {
    const flexResult = await client.pushMessage({
      to: payload.recipientLineUserId,
      messages: [messages.flex],
    });

    if (flexResult.ok) {
      logNotification("info", {
        event: payload.event,
        recipient: payload.recipientLineUserId,
        responseStatus: flexResult.status,
        responseBody: flexResult.body,
      });
      return { status: "SUCCESS", message: "Flex message sent." };
    }

    const textResult = await client.pushMessage({
      to: payload.recipientLineUserId,
      messages: [messages.text],
    });

    if (textResult.ok) {
      logNotification("warn", {
        event: payload.event,
        recipient: payload.recipientLineUserId,
        responseStatus: textResult.status,
        responseBody: textResult.body,
        fallback: "text",
      });
      return { status: "SUCCESS", message: "Text fallback sent." };
    }

    logNotification("warn", {
      event: payload.event,
      recipient: payload.recipientLineUserId,
      flexResponseStatus: flexResult.status,
      flexResponseBody: flexResult.body,
      textResponseStatus: textResult.status,
      textResponseBody: textResult.body,
    });
    return {
      status: "FAILED",
      message: "LINE API rejected both flex and text messages.",
      error: textResult.body,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown LINE error.";
    logNotification("error", {
      event: payload.event,
      recipient: payload.recipientLineUserId,
      error: message,
    });
    return { status: "ERROR", message: "LINE send failed.", error: message };
  }
}

type BookingEventInput = {
  recipientLineUserId: string | null | undefined;
  bookingNumber: string;
  merchantName: string;
  bookingDate: Date;
  status: string;
  customerPath?: string;
};

function buildCustomerBookingPath(bookingNumber: string, overridePath?: string) {
  return overridePath ?? `/bookings/${bookingNumber}`;
}

export async function sendBookingCreated(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_CREATED", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Booking created",
      subtitle: "Your booking has been created and is pending confirmation.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendBookingConfirmed(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_CONFIRMED", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Booking confirmed",
      subtitle: "Your booking has been confirmed.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendBookingReminder(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_REMINDER", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Booking reminder",
      subtitle: "Your booking starts in 30 minutes.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendUpcomingBookingReminder(input: BookingEventInput) {
  return sendBookingReminder(input);
}

export async function sendBookingStarted(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_STARTED", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Service started",
      subtitle: "Your booking service has started.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendBookingCompleted(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_COMPLETED", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Booking completed",
      subtitle: "Your booking has been completed.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendBookingCancelled(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_CANCELLED", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "Booking cancelled",
      subtitle: "Your booking has been cancelled.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

export async function sendBookingNoShow(input: BookingEventInput) {
  return sendLineMessages(
    { event: "BOOKING_NO_SHOW", recipientLineUserId: input.recipientLineUserId },
    buildBookingMessages({
      title: "No-show recorded",
      subtitle: "Your booking was marked as no-show.",
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      bookingDate: input.bookingDate,
      status: input.status,
      deepLinkPath: buildCustomerBookingPath(input.bookingNumber, input.customerPath),
    }),
  );
}

type MerchantApprovedInput = {
  recipientLineUserId: string | null | undefined;
  merchantName: string;
};

export async function sendMerchantApproved(input: MerchantApprovedInput) {
  return sendLineMessages(
    { event: "MERCHANT_APPROVED", recipientLineUserId: input.recipientLineUserId },
    buildMerchantApprovedMessages({
      subtitle: "Your merchant account has been approved.",
      merchantName: input.merchantName,
      deepLinkPath: "/merchant/dashboard",
    }),
  );
}

type BillingEventInput = {
  recipientLineUserId: string | null | undefined;
  billingId: string;
  billingNumber: string;
  merchantName: string;
  status: string;
};

export async function sendBillingGenerated(input: BillingEventInput) {
  return sendLineMessages(
    { event: "BILLING_GENERATED", recipientLineUserId: input.recipientLineUserId },
    buildBillingMessages({
      title: "Billing generated",
      subtitle: "A new billing statement has been generated.",
      billingNumber: input.billingNumber,
      merchantName: input.merchantName,
      status: input.status,
      deepLinkPath: `/merchant/billings/${input.billingId}`,
    }),
  );
}

export async function sendBillingApproved(input: BillingEventInput) {
  return sendLineMessages(
    { event: "BILLING_APPROVED", recipientLineUserId: input.recipientLineUserId },
    buildBillingMessages({
      title: "Billing approved",
      subtitle: "Your billing statement has been approved.",
      billingNumber: input.billingNumber,
      merchantName: input.merchantName,
      status: input.status,
      deepLinkPath: `/merchant/billings/${input.billingId}`,
    }),
  );
}

export async function sendPaymentApproved(input: BillingEventInput) {
  return sendLineMessages(
    { event: "PAYMENT_APPROVED", recipientLineUserId: input.recipientLineUserId },
    buildBillingMessages({
      title: "Payment approved",
      subtitle: "Your payment submission has been approved.",
      billingNumber: input.billingNumber,
      merchantName: input.merchantName,
      status: input.status,
      deepLinkPath: `/merchant/billings/${input.billingId}`,
    }),
  );
}
