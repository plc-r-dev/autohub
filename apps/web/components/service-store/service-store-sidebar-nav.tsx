"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { serviceStoreNavItems } from "@/components/service-store/service-store-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

type NavProps = {
  /** Pending/no-store states: nothing under /app is reachable yet. */
  locked?: boolean;
};

export function ServiceStoreSidebarNav({ locked = false }: NavProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className="flex flex-col gap-1">
        {serviceStoreNavItems.map((item) => {
          if (locked) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  render={
                    <span
                      role="button"
                      aria-disabled="true"
                      tabIndex={0}
                      className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
                    >
                      <span>{item.label}</span>
                      <Lock className="size-3.5" />
                    </span>
                  }
                />
                <TooltipContent>Available after approval</TooltipContent>
              </Tooltip>
            );
          }

          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function ServiceStoreMobileNav({ locked = false }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {serviceStoreNavItems.map((item) => {
        if (locked) {
          return (
            <button
              key={item.href}
              type="button"
              disabled
              title="Available after approval"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground/50"
            >
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
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
