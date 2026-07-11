"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ListDateFilterProps = {
  fromKey?: string;
  toKey?: string;
};

export function ListDateFilter({ fromKey = "from", toKey = "to" }: ListDateFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get(fromKey) ?? "";
  const to = searchParams.get(toKey) ?? "";

  function updateDate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[#15202b]">From</span>
        <input
          type="date"
          value={from}
          onChange={(event) => updateDate(fromKey, event.target.value)}
          className="h-11 rounded-xl border border-[#dce5ee] bg-white px-3 text-[#15202b]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[#15202b]">To</span>
        <input
          type="date"
          value={to}
          onChange={(event) => updateDate(toKey, event.target.value)}
          className="h-11 rounded-xl border border-[#dce5ee] bg-white px-3 text-[#15202b]"
        />
      </label>
    </>
  );
}
