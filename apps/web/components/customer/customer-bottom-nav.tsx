"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Car, Home, User } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const TABS = [
  { href: "/browse", label: "Home", icon: Home, match: (path: string) => path === "/browse" },
  {
    href: "/bookings",
    label: "Bookings",
    icon: Calendar,
    match: (path: string) => path === "/bookings",
  },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: Car,
    match: (path: string) => path === "/vehicles",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: (path: string) => path === "/profile",
  },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 border-t border-[#E4E4E7] bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition-colors",
                active ? "text-[#18181B]" : "text-[#A1A1AA] active:text-[#71717A]",
              )}
            >
              <Icon
                className={cn("size-[22px]", active && "stroke-[2.5px]")}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
