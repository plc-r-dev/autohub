import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingSection, MarketingSectionHeading } from "@/components/marketing/section-container";
import { PORTALS } from "@/lib/auth/portals";

const PORTAL_OPTIONS = [
  {
    href: PORTALS.serviceStore.login,
    icon: Store,
    label: "Service Store",
    description: "Manage bookings, branches, staff, and billing.",
  },
  {
    href: PORTALS.admin.login,
    icon: ShieldCheck,
    label: "Platform Admin",
    description: "Manage the AutoHub platform.",
  },
] as const;

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingSection>
          <MarketingSectionHeading title="Choose your portal" />
          <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
            {PORTAL_OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-10 text-center transition-colors hover:bg-muted/60"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <option.icon className="size-6 text-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">{option.label}</span>
                <span className="text-sm text-muted-foreground">{option.description}</span>
              </Link>
            ))}
          </div>
        </MarketingSection>
      </main>
      <SiteFooter />
    </div>
  );
}
