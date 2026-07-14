import { ThemeToggle } from "@/components/theme-toggle";
import { AutohubLogo } from "@/components/brand/autohub-logo";
import { MarketingSignInButton } from "@/components/marketing/marketing-sign-in-button";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <AutohubLogo href="/" heightClassName="h-8" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Customer booking is available through the AutoHub LINE Official Account.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <MarketingSignInButton className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </MarketingSignInButton>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AutoHub. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
