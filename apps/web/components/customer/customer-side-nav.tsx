"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { AutohubLogo } from "@/components/brand/autohub-logo";

const TABS = [
  { href: "/browse", label: "Home", icon: "🏠", match: (path: string) => path === "/browse" },
  {
    href: "/bookings",
    label: "My Bookings",
    icon: "📅",
    match: (path: string) => path === "/bookings" || path.startsWith("/bookings/"),
  },
  {
    href: "/vehicles",
    label: "My Vehicles",
    icon: "🚗",
    match: (path: string) => path === "/vehicles" || path.startsWith("/vehicles/"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: "👤",
    match: (path: string) => path === "/profile",
  },
] as const;

export function CustomerSideNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-[#e8eaed] bg-white p-4 md:flex"
      aria-label="Customer navigation"
    >
      <div className="mb-3 px-3">
        <AutohubLogo href="/browse" heightClassName="h-6" />
      </div>
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-[#F0FDF4] text-[#16A34A]"
                : "text-[#3d4d5c] hover:bg-[#f5f6f8]",
            )}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
