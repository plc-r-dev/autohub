"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { serviceStoreNavItems } from "@/components/service-store/service-store-nav";
import { cn } from "@workspace/ui/lib/utils";

export function ServiceStoreSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {serviceStoreNavItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#ecfdf5] text-[#0b7a3a]"
                : "text-[#5b6b7a] hover:bg-white hover:text-[#15202b]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ServiceStoreMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {serviceStoreNavItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[#06C755] text-white"
                : "border border-[#dce5ee] bg-white text-[#5b6b7a]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
