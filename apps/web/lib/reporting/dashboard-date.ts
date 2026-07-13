export function formatDashboardDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDashboardDateKey(value?: string): Date {
  if (!value) {
    return startOfDay(new Date());
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return startOfDay(new Date());
  }

  return startOfDay(new Date(year, month - 1, day));
}

export function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(left: Date, right: Date): boolean {
  return formatDashboardDateKey(left) === formatDashboardDateKey(right);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getDashboardKpiLabels(date: Date) {
  if (isToday(date)) {
    return {
      bookings: "Today's bookings",
      revenue: "Revenue today",
      schedule: "Today's schedule",
    };
  }

  const label = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return {
    bookings: `Bookings · ${label}`,
    revenue: `Revenue · ${label}`,
    schedule: `Schedule · ${label}`,
  };
}
