"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/customer/ui/search-bar";

type BrowseSearchProps = {
  placeholder?: string;
};

export function BrowseSearch({ placeholder = "Search services…" }: BrowseSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const currentSearch = searchParams.get("q") ?? "";
      if (currentSearch === searchText.trim()) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (searchText.trim()) {
        params.set("q", searchText.trim());
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchText, pathname, router, searchParams]);

  return (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      placeholder={placeholder}
    />
  );
}
