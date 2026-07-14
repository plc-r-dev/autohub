"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { AutohubLogo } from "@/components/brand/autohub-logo";
import { MarketingSignInButton } from "@/components/marketing/marketing-sign-in-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PORTALS } from "@/lib/auth/portals";

const SECTION_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#customers", label: "For Customers" },
  { href: "#service-stores", label: "For Service Stores" },
] as const;

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Only the landing page has a hero to sit transparently over; every
  // other page (e.g. /app/login) must render a solid header from the start.
  const canBeTransparent = pathname === "/";

  useEffect(() => {
    if (!canBeTransparent) return;

    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canBeTransparent]);

  const transparent = canBeTransparent && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
        transparent
          ? "border-transparent bg-transparent"
          : "border-border bg-background/95 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <AutohubLogo href="/" heightClassName="h-8" priority />

        <nav className="hidden items-center gap-8 lg:flex">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <MarketingSignInButton className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Sign In
          </MarketingSignInButton>
          <Link href={PORTALS.marketing.openInLine} className={cn(buttonVariants({ size: "sm" }))}>
            Open LINE
          </Link>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-background px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </a>
            ))}
            <MarketingSignInButton className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted">
              Sign In
            </MarketingSignInButton>
            <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
              <span className="text-sm font-medium text-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={PORTALS.marketing.openInLine}
              onClick={() => setMenuOpen(false)}
              className={cn(buttonVariants(), "w-full")}
            >
              Open LINE
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
