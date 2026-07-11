"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "nearby", label: "Nearby" },
] as const;

export function BrowseServiceStoreFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("nearby") === "1" ? "nearby" : "all";

  function setFilter(next: (typeof FILTERS)[number]["key"]) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "nearby") {
      params.set("nearby", "1");
    } else {
      params.delete("nearby");
    }
    params.set("page", "1");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const selected = active === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => setFilter(filter.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors",
              selected
                ? "border-[#062C21] bg-[#062C21] text-white"
                : "border-[#E2E8F0] bg-white text-[#0A0A0A] hover:border-[#CBD5E1]",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
