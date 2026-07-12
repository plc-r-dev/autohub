import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MarketingSection } from "@/components/marketing/section-container";
import { PORTALS } from "@/lib/auth/portals";

export function ForCustomers() {
  return (
    <MarketingSection id="customers" tone="muted" className="text-center">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        For Customers
      </p>
      <h2 className="mx-auto mt-2 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Book a Service
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Book your automotive service through the AutoHub LINE Official Account.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href={PORTALS.marketing.openInLine}
          className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 px-10 text-base")}
        >
          <MessageCircle className="size-5" />
          Open LINE
        </Link>
      </div>
    </MarketingSection>
  );
}
