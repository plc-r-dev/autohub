"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { formatDashboardDateKey } from "@/lib/reporting/dashboard-date";
import { cn } from "@workspace/ui/lib/utils";

type DashboardDateFilterProps = {
  className?: string;
};

export function DashboardDateFilter({ className }: DashboardDateFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const todayKey = formatDashboardDateKey(new Date());
  const selectedDate = searchParams.get("date") ?? todayKey;

  function updateDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === todayKey) {
      params.delete("date");
    } else {
      params.set("date", value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className={cn("relative inline-flex shrink-0", className)}>
      <span className="sr-only">Dashboard date</span>
      <Calendar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#166534] dark:text-emerald-400" />
      <input
        type="date"
        value={selectedDate}
        max={todayKey}
        onChange={(event) => updateDate(event.target.value)}
        className="h-10 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] pr-4 pl-10 text-sm text-foreground outline-none transition-colors hover:border-[#16A34A]/50 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 dark:border-emerald-900/50 dark:bg-emerald-950/30"
        aria-label="Dashboard date"
      />
    </label>
  );
}
