"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  Lock,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { serviceStoreNavItems } from "@/components/service-store/service-store-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/app/dashboard": LayoutDashboard,
  "/app/bookings": CalendarDays,
  "/app/customers": Users,
  "/app/billings": Receipt,
  "/app/settings": Settings,
};

type NavProps = {
  /** Pending/no-store states: nothing under /app is reachable yet. */
  locked?: boolean;
  /** Catalog incomplete: only Store Settings is reachable. */
  settingsOnly?: boolean;
};

function NavIcon({ href }: { href: string }) {
  const Icon = NAV_ICONS[href] ?? HelpCircle;
  return <Icon className="size-4 shrink-0" strokeWidth={2} />;
}

function LockedNavItem({
  href,
  label,
  reason,
}: {
  href: string;
  label: string;
  reason: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            role="button"
            aria-disabled="true"
            tabIndex={0}
            className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
          >
            <span className="flex items-center gap-3">
              <NavIcon href={href} />
              {label}
            </span>
            <Lock className="size-3.5" />
          </span>
        }
      />
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

export function ServiceStoreSidebarNav({
  locked = false,
  settingsOnly = false,
}: NavProps) {
  const pathname = usePathname();
  const lockReason = locked
    ? "Available after approval"
    : "Add services and opening hours in Store Settings first";

  return (
    <TooltipProvider>
      <nav className="flex flex-col gap-1">
        {serviceStoreNavItems.map((item) => {
          const isSettings = item.href === "/app/settings";
          const itemLocked = locked || (settingsOnly && !isSettings);

          if (itemLocked) {
            return (
              <LockedNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                reason={lockReason}
              />
            );
          }

          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              {active ? (
                <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              ) : null}
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function ServiceStoreMobileNav({
  locked = false,
  settingsOnly = false,
}: NavProps) {
  const pathname = usePathname();
  const lockReason = locked
    ? "Available after approval"
    : "Add services and opening hours in Store Settings first";

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {serviceStoreNavItems.map((item) => {
        const isSettings = item.href === "/app/settings";
        const itemLocked = locked || (settingsOnly && !isSettings);

        if (itemLocked) {
          return (
            <button
              key={item.href}
              type="button"
              disabled
              title={lockReason}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground/50"
            >
              <NavIcon href={item.href} />
              {item.label}
              <Lock className="size-3" />
            </button>
          );
        }

        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground",
            )}
          >
            <NavIcon href={item.href} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
