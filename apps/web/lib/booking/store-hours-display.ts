const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type HoursRow = {
  day: string;
  hours: string;
  isToday?: boolean;
};

export type StoreOpenStatus = {
  isOpen: boolean;
  label: string;
  closesAt?: string;
};

type OperatingHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export function formatOperatingHoursRows(hours: OperatingHourRow[]): HoursRow[] {
  const today = new Date().getDay();
  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return sorted.map((row) => ({
    day: DAY_LABELS[row.dayOfWeek] ?? `Day ${row.dayOfWeek}`,
    hours: row.isClosed ? "Closed" : `${row.openTime} – ${row.closeTime}`,
    isToday: row.dayOfWeek === today,
  }));
}

export function resolveStoreOpenStatus(hours: OperatingHourRow[]): StoreOpenStatus {
  const now = new Date();
  const day = now.getDay();
  const today = hours.find((row) => row.dayOfWeek === day);

  if (!today || today.isClosed) {
    return { isOpen: false, label: "Closed" };
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeMinutes(today.openTime);
  const closeMinutes = parseTimeMinutes(today.closeTime);

  if (openMinutes == null || closeMinutes == null) {
    return { isOpen: true, label: "Open" };
  }

  if (minutes >= openMinutes && minutes < closeMinutes) {
    return { isOpen: true, label: "Open", closesAt: today.closeTime };
  }

  return { isOpen: false, label: "Closed" };
}

function parseTimeMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
