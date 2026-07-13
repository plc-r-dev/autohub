"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

type BookingCalendarProps = {
  value: string;
  onChange: (dateValue: string) => void;
  minDateValue: string;
};

export function BookingCalendar({ value, onChange, minDateValue }: BookingCalendarProps) {
  const selected = parseDateValue(value);
  const minDate = parseDateValue(minDateValue);
  const [visibleYear, setVisibleYear] = useState(selected.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(selected.getMonth());

  const firstOfMonth = new Date(visibleYear, visibleMonth, 1);
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const startOffset = firstOfMonth.getDay();

  const cells: Array<{ day: number; dateValue: string; disabled: boolean } | null> = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(visibleYear, visibleMonth, day);
    cells.push({
      day,
      dateValue: toDateValue(date),
      disabled: date < minDate,
    });
  }

  function goToPrevMonth() {
    const prev = new Date(visibleYear, visibleMonth - 1, 1);
    setVisibleYear(prev.getFullYear());
    setVisibleMonth(prev.getMonth());
  }

  function goToNextMonth() {
    const next = new Date(visibleYear, visibleMonth + 1, 1);
    setVisibleYear(next.getFullYear());
    setVisibleMonth(next.getMonth());
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(firstOfMonth);
  const isPrevDisabled = visibleYear === minDate.getFullYear() && visibleMonth === minDate.getMonth();

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#0F172A]">{monthLabel}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={isPrevDisabled}
            className="flex size-9 items-center justify-center rounded-full border border-[#E2E8F0] text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="flex size-9 items-center justify-center rounded-full border border-[#E2E8F0] text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[12px] font-medium text-[#94A3B8]">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) =>
          cell === null ? (
            <span key={`empty-${index}`} />
          ) : (
            <button
              key={cell.dateValue}
              type="button"
              disabled={cell.disabled}
              onClick={() => onChange(cell.dateValue)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full text-[14px] font-medium transition-colors",
                cell.dateValue === value
                  ? "bg-[#16A34A] text-white dark:border dark:border-border dark:bg-muted dark:text-foreground"
                  : cell.disabled
                    ? "cursor-not-allowed text-[#CBD5E1]"
                    : "text-[#0F172A] hover:bg-[#F1F5F9]",
              )}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
