"use client";

import { Calendar } from "lucide-react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BOOKING_DATE_RANGE_OPTIONS,
  type BookingDateRangePreset,
} from "@/lib/booking/booking-list-date";
import { BOOKING_STATUS_OPTIONS } from "@/lib/booking/format";
import {
  managementPillActive,
  managementPillBase,
  managementPillInactive,
  managementSelectClassName,
} from "@/components/listing/management/styles";
import { ManagementListSearch } from "@/components/listing/management/list-search";
import { cn } from "@workspace/ui/lib/utils";

type BookingListFiltersProps = {
  showBranchFilter?: boolean;
  branches?: Array<{ id: string; name: string }>;
};

const pillBase = managementPillBase;
const pillInactive = managementPillInactive;
const pillActive = managementPillActive;

/** Search + pill filters for the bookings list. */
export function BookingListFilters({
  showBranchFilter = false,
  branches = [],
}: BookingListFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = (searchParams.get("range") ?? "all") as BookingDateRangePreset;
  const currentStatus = searchParams.get("status") ?? "";
  const isCustomRange = currentRange === "custom";

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchParams.get("q") ||
          searchParams.get("status") ||
          (showBranchFilter && searchParams.get("branchId")) ||
          (searchParams.get("range") ?? "all") !== "all" ||
          searchParams.get("from") ||
          searchParams.get("to"),
      ),
    [searchParams, showBranchFilter],
  );

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    params.delete("page");
    params.delete("pageSize");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearAllFilters() {
    router.replace(pathname);
  }

  return (
    <div className="space-y-3">
      <ManagementListSearch
        placeholder="Search booking no., customer, or plate number"
        ariaLabel="Search bookings"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5">
          {BOOKING_DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                updateParams((params) => {
                  if (option.value === "all") {
                    params.delete("range");
                  } else {
                    params.set("range", option.value);
                  }
                  if (option.value !== "custom") {
                    params.delete("from");
                    params.delete("to");
                  }
                })
              }
              className={cn(
                pillBase,
                currentRange === option.value ||
                  (option.value === "all" && !searchParams.get("range"))
                  ? pillActive
                  : pillInactive,
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="relative min-w-[9.5rem]">
            <span className="sr-only">Status</span>
            <select
              value={currentStatus}
              onChange={(event) =>
                updateParams((params) => {
                  if (event.target.value) {
                    params.set("status", event.target.value);
                  } else {
                    params.delete("status");
                  }
                })
              }
              className={managementSelectClassName(Boolean(currentStatus))}
              aria-label="Status"
            >
              <option value="">All statuses</option>
              {BOOKING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {showBranchFilter ? (
            <label className="relative min-w-[9.5rem]">
              <span className="sr-only">Branch</span>
              <select
                value={searchParams.get("branchId") ?? ""}
                onChange={(event) =>
                  updateParams((params) => {
                    if (event.target.value) {
                      params.set("branchId", event.target.value);
                    } else {
                      params.delete("branchId");
                    }
                  })
                }
                className={managementSelectClassName(Boolean(searchParams.get("branchId")))}
                aria-label="Branch"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className={cn(pillBase, pillInactive, "px-3")}
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {isCustomRange ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#dce5ee] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-[#5b6b7a]">
            <Calendar className="size-4 text-[#166534]" />
            Custom range
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <label className="relative">
              <span className="sr-only">From date</span>
              <input
                type="date"
                value={searchParams.get("from") ?? ""}
                onChange={(event) =>
                  updateParams((params) => {
                    if (event.target.value) {
                      params.set("from", event.target.value);
                    } else {
                      params.delete("from");
                    }
                  })
                }
                className="h-10 w-full rounded-full border border-[#dce5ee] bg-[#f8fcfa] px-4 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15"
              />
            </label>
            <label className="relative">
              <span className="sr-only">To date</span>
              <input
                type="date"
                value={searchParams.get("to") ?? ""}
                onChange={(event) =>
                  updateParams((params) => {
                    if (event.target.value) {
                      params.set("to", event.target.value);
                    } else {
                      params.delete("to");
                    }
                  })
                }
                className="h-10 w-full rounded-full border border-[#dce5ee] bg-[#f8fcfa] px-4 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15"
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
