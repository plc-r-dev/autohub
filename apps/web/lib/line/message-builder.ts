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
  serviceStoreName: string;
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
      serviceStoreName: input.serviceStoreName,
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
        `Service shop: ${input.serviceStoreName}`,
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
  serviceStoreName: string;
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
      serviceStoreName: input.serviceStoreName,
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
        `ServiceStore: ${input.serviceStoreName}`,
        `Status: ${input.status}`,
        deepLink,
      ].join("\n"),
    },
  } as const;
}

type ServiceStoreTemplateInput = {
  subtitle: string;
  serviceStoreName: string;
  deepLinkPath: string;
};

export function buildServiceStoreApprovedMessages(input: ServiceStoreTemplateInput) {
  const deepLink = toAbsoluteDeepLink(input.deepLinkPath);
  return {
    flex: {
      type: "flex",
      altText: "AutoHub: ServiceStore approved",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            { type: "text", text: "AutoHub", weight: "bold", size: "xl" },
            { type: "text", text: input.subtitle, wrap: true, size: "sm" },
            { type: "text", text: `ServiceStore: ${input.serviceStoreName}`, size: "sm" },
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
      text: `🚗 AutoHub\n${input.subtitle}\nServiceStore: ${input.serviceStoreName}\n${deepLink}`,
    },
  } as const;
}
