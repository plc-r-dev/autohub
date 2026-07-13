import {
  addDays,
  endOfDay,
  formatDashboardDateKey,
  parseDashboardDateKey,
  startOfDay,
} from "@/lib/reporting/dashboard-date";

export type BookingDateRangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "custom";

export const BOOKING_DATE_RANGE_OPTIONS: Array<{
  value: BookingDateRangePreset;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

const PRESET_SET = new Set<string>(BOOKING_DATE_RANGE_OPTIONS.map((option) => option.value));

export function parseBookingDateRangePreset(
  value?: string,
): BookingDateRangePreset {
  if (value && PRESET_SET.has(value)) {
    return value as BookingDateRangePreset;
  }
  return "today";
}

export function resolveBookingListDateRange(params: {
  range?: string;
  from?: string;
  to?: string;
}): { preset: BookingDateRangePreset; from: Date; to: Date } {
  const preset = parseBookingDateRangePreset(params.range);
  const now = new Date();

  switch (preset) {
    case "yesterday": {
      const day = addDays(now, -1);
      return { preset, from: startOfDay(day), to: endOfDay(day) };
    }
    case "last7":
      return {
        preset,
        from: startOfDay(addDays(now, -6)),
        to: endOfDay(now),
      };
    case "last30":
      return {
        preset,
        from: startOfDay(addDays(now, -29)),
        to: endOfDay(now),
      };
    case "thisMonth":
      return {
        preset,
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
      };
    case "custom": {
      const from = params.from
        ? startOfDay(parseDashboardDateKey(params.from))
        : startOfDay(now);
      const to = params.to ? endOfDay(parseDashboardDateKey(params.to)) : endOfDay(now);
      return { preset, from, to };
    }
    case "today":
    default:
      return { preset: "today", from: startOfDay(now), to: endOfDay(now) };
  }
}

export function isSingleDayBookingRange(from: Date, to: Date) {
  return formatDashboardDateKey(from) === formatDashboardDateKey(to);
}
