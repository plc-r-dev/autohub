export type {
  FlexMessagePayload,
  LineFlexMessagePort,
  LineNotificationPayload,
  LineNotificationPort,
} from "@/lib/line/domain/ports";

// Infrastructure (existing — do not reimplement)
export { getLineClient } from "@/lib/line/line-client";
export {
  sendBookingCreated,
  sendBookingConfirmed,
  sendBookingCancelled,
  sendBookingReminder,
  sendServiceStoreApproved,
  sendBillingGenerated,
  sendPaymentApproved,
} from "@/lib/line/line-notification-service";
export { buildLiffEntryUrl } from "@/lib/liff/deep-links";
