import type { JobSchedule } from "@/lib/jobs/types";

export function getNextRunDate(schedule: JobSchedule, now = new Date()): Date {
  if (schedule.kind === "interval") {
    return new Date(now.getTime() + schedule.minutes * 60 * 1000);
  }

  if (schedule.expression === "*/5 * * * *") {
    const next = new Date(now);
    next.setSeconds(0, 0);
    const mod = next.getMinutes() % 5;
    next.setMinutes(next.getMinutes() + (mod === 0 ? 5 : 5 - mod));
    return next;
  }

  if (schedule.expression === "0 0 * * *") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  if (schedule.expression === "5 0 1 * *") {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1, 1);
    next.setHours(0, 5, 0, 0);
    return next;
  }

  return new Date(now);
}

export function formatSchedule(schedule: JobSchedule): string {
  if (schedule.kind === "interval") {
    return schedule.humanReadable;
  }
  return `${schedule.humanReadable} (${schedule.expression})`;
}
