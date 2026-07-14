import { LogIn } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { LineOAuthButton } from "@/components/auth/line-oauth-button";
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
        Manage bookings, customers, staff, payments and daily operations with AutoHub.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <LineOAuthButton
          callbackUrl={PORTALS.serviceStore.home}
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex h-12 items-center gap-2 px-10 text-base",
          )}
        >
          <LogIn className="size-5" />
          Sign In
        </LineOAuthButton>
      </div>
    </MarketingSection>
  );
}
