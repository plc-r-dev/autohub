import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MarketingSection } from "@/components/marketing/section-container";
import { PORTALS } from "@/lib/auth/portals";

export function FinalCta() {
  return (
    <MarketingSection tone="muted" className="text-center">
      <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Bring your service business onto AutoHub
      </h2>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href={PORTALS.serviceStore.onboarding}
          className={cn(buttonVariants({ size: "lg" }), "h-12 px-10 text-base")}
        >
          Get Started
        </Link>
        <Link
          href={PORTALS.marketing.signIn}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-10 text-base")}
        >
          Sign In
        </Link>
      </div>
    </MarketingSection>
  );
}
