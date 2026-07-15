"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, Home, Menu, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AutohubLogo } from "@/components/brand/autohub-logo";

const NAV_LINKS = [
  { href: "/browse", label: "Home", icon: Home },
  { href: "/bookings", label: "Bookings", icon: Calendar },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/browse") {
    return pathname === "/browse" || pathname === "/" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerTopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E8E8] bg-[#F8F8F8]/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 md:px-8">
        <AutohubLogo href="/browse" heightClassName="h-[22px]" priority />

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#0F172A]",
                  active && "text-[#0F172A]",
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#062C21]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#E8E8E8] bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium",
                    active ? "bg-[#F0F0F0] text-[#0F172A]" : "text-[#0F172A]",
                  )}
                >
                  <Icon className="size-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
