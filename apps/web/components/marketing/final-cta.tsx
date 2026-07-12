import Link from "next/link";
import { MessageCircle, Store } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MarketingSection } from "@/components/marketing/section-container";
import { PORTALS } from "@/lib/auth/portals";

export function FinalCta() {
  return (
    <MarketingSection tone="muted" className="relative overflow-hidden text-center">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Ready to get started?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Customers book through LINE. Service Stores manage their business through AutoHub.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href={PORTALS.marketing.openInLine}
          className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 px-10 text-base")}
        >
          <MessageCircle className="size-5" />
          Open LINE
        </Link>
        <Link
          href={`${PORTALS.serviceStore.onboarding}?mode=claim`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 gap-2 px-10 text-base")}
        >
          <Store className="size-5" />
          Claim or Create a Store
        </Link>
      </div>
    </MarketingSection>
  );
}
