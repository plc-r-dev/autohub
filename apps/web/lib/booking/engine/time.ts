export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_SLOT_INTERVAL_MINUTES = 15;
export const DEFAULT_CONCURRENT_CAPACITY = 1;
export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "18:00";

export function parseTimeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function combineDateAndTime(date: string, time: string): Date {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const [hours = 0, minutes = 0] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function getDayBounds(date: string) {
  return {
    start: combineDateAndTime(date, "00:00"),
    end: combineDateAndTime(date, "23:59"),
  };
}

export function getDefaultOperatingHours() {
  return DAY_LABELS.map((_, dayOfWeek) => ({
    dayOfWeek,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    isClosed: dayOfWeek === 0 || dayOfWeek === 6,
  }));
}
