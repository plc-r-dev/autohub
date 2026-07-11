import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { PORTALS } from "@/lib/auth/portals";

export function Hero() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-28 text-center md:px-10 md:py-36">
        <h1 className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl md:text-8xl">
          AutoHub
        </h1>
        <p className="mt-6 text-2xl font-medium text-foreground sm:text-3xl">
          The Automotive Service Platform
        </p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Run your entire automotive service business — from booking to operations.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
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
      </div>
    </section>
  );
}
