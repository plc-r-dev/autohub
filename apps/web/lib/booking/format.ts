export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatPrice(value: { toString(): string } | number) {
  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function bookingStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function formatTimelineLabel(key: string) {
  switch (key) {
    case "confirmedAt":
      return "Confirmed";
    case "startedAt":
      return "Started";
    case "completedAt":
      return "Completed";
    case "cancelledAt":
      return "Cancelled";
    case "noShowAt":
      return "No-show";
    default:
      return key;
  }
}
