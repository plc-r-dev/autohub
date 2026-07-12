import Link from "next/link";
import { Store, Building2 } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MarketingSection } from "@/components/marketing/section-container";
import { PORTALS } from "@/lib/auth/portals";

export function ForServiceStores() {
  return (
    <MarketingSection id="service-stores" className="text-center">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        For Service Stores
      </p>
      <h2 className="mx-auto mt-2 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Grow your Service Business
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Manage bookings, customers, staff, and operations with AutoHub.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href={`${PORTALS.serviceStore.onboarding}?mode=claim`}
          className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 px-10 text-base")}
        >
          <Store className="size-5" />
          Claim Existing Store
        </Link>
        <Link
          href={`${PORTALS.serviceStore.onboarding}?mode=create`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 gap-2 px-10 text-base")}
        >
          <Building2 className="size-5" />
          Create New Store
        </Link>
      </div>
    </MarketingSection>
  );
}
