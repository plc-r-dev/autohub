import { buildBillingFlexMessage, buildBookingFlexMessage } from "@/lib/line/flex-builder";

function formatDateTime(value: Date) {
  const dateLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
  const timeLabel = new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(value);
  return { dateLabel, timeLabel };
}

function getBaseUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export function toAbsoluteDeepLink(path: string): string {
  const base = getBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

type BookingTemplateInput = {
  title: string;
  subtitle: string;
  bookingNumber: string;
  merchantName: string;
  bookingDate: Date;
  status: string;
  deepLinkPath: string;
};

export function buildBookingMessages(input: BookingTemplateInput) {
  const { dateLabel, timeLabel } = formatDateTime(input.bookingDate);
  const deepLink = toAbsoluteDeepLink(input.deepLinkPath);

  return {
    flex: buildBookingFlexMessage({
      title: input.title,
      subtitle: input.subtitle,
      bookingNumber: input.bookingNumber,
      merchantName: input.merchantName,
      dateLabel,
      timeLabel,
      status: input.status,
      deepLink,
    }),
    text: {
      type: "text",
      text: [
        "🚗 AutoHub",
        input.subtitle,
        "",
        `Booking: ${input.bookingNumber}`,
        `Merchant: ${input.merchantName}`,
        `Date: ${dateLabel}`,
        `Time: ${timeLabel}`,
        `Status: ${input.status}`,
        deepLink,
      ].join("\n"),
    },
  } as const;
}

type BillingTemplateInput = {
  title: string;
  subtitle: string;
  billingNumber: string;
  merchantName: string;
  status: string;
  deepLinkPath: string;
};

export function buildBillingMessages(input: BillingTemplateInput) {
  const deepLink = toAbsoluteDeepLink(input.deepLinkPath);
  return {
    flex: buildBillingFlexMessage({
      title: input.title,
      subtitle: input.subtitle,
      billingNumber: input.billingNumber,
      merchantName: input.merchantName,
      status: input.status,
      deepLink,
    }),
    text: {
      type: "text",
      text: [
        "🚗 AutoHub",
        input.subtitle,
        "",
        `Billing: ${input.billingNumber}`,
        `Merchant: ${input.merchantName}`,
        `Status: ${input.status}`,
        deepLink,
      ].join("\n"),
    },
  } as const;
}

type MerchantTemplateInput = {
  subtitle: string;
  merchantName: string;
  deepLinkPath: string;
};

export function buildMerchantApprovedMessages(input: MerchantTemplateInput) {
  const deepLink = toAbsoluteDeepLink(input.deepLinkPath);
  return {
    flex: {
      type: "flex",
      altText: "AutoHub: Merchant approved",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            { type: "text", text: "AutoHub", weight: "bold", size: "xl" },
            { type: "text", text: input.subtitle, wrap: true, size: "sm" },
            { type: "text", text: `Merchant: ${input.merchantName}`, size: "sm" },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              action: { type: "uri", label: "Open dashboard", uri: deepLink },
            },
          ],
        },
      },
    },
    text: {
      type: "text",
      text: `🚗 AutoHub\n${input.subtitle}\nMerchant: ${input.merchantName}\n${deepLink}`,
    },
  } as const;
}
