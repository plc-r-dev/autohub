export type BookingFlexInput = {
  title: string;
  subtitle: string;
  bookingNumber: string;
  merchantName: string;
  dateLabel: string;
  timeLabel: string;
  status: string;
  deepLink: string;
};

export type BillingFlexInput = {
  title: string;
  subtitle: string;
  billingNumber: string;
  merchantName: string;
  status: string;
  deepLink: string;
};

export function buildBookingFlexMessage(input: BookingFlexInput) {
  return {
    type: "flex",
    altText: `AutoHub: ${input.title}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "AutoHub", weight: "bold", size: "xl" },
          { type: "text", text: input.subtitle, wrap: true, color: "#555555", size: "sm" },
          { type: "separator" },
          { type: "text", text: `Booking: ${input.bookingNumber}`, wrap: true, size: "sm" },
          { type: "text", text: `Service shop: ${input.merchantName}`, wrap: true, size: "sm" },
          { type: "text", text: `Date: ${input.dateLabel}`, size: "sm" },
          { type: "text", text: `Time: ${input.timeLabel}`, size: "sm" },
          { type: "text", text: `Status: ${input.status}`, size: "sm" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "Open in AutoHub",
              uri: input.deepLink,
            },
          },
        ],
      },
    },
  } as const;
}

export function buildBillingFlexMessage(input: BillingFlexInput) {
  return {
    type: "flex",
    altText: `AutoHub: ${input.title}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "AutoHub", weight: "bold", size: "xl" },
          { type: "text", text: input.subtitle, wrap: true, color: "#555555", size: "sm" },
          { type: "separator" },
          { type: "text", text: `Billing: ${input.billingNumber}`, wrap: true, size: "sm" },
          { type: "text", text: `Service shop: ${input.merchantName}`, wrap: true, size: "sm" },
          { type: "text", text: `Status: ${input.status}`, size: "sm" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "Open billing",
              uri: input.deepLink,
            },
          },
        ],
      },
    },
  } as const;
}
