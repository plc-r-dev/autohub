import Link from "next/link";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { Button } from "@workspace/ui/components/button";
import { requireOnboardingContext } from "@/lib/onboarding/context";

export default async function OnboardingPage() {
  await requireOnboardingContext();

  return (
    <OnboardingLayout
      title="Welcome to AutoHub"
      description="Your LINE account is signed in. Choose how you want to use AutoHub."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/onboarding/customer" className="block">
          <Button
            variant="outline"
            className="h-auto w-full flex-col items-start gap-2 p-4 text-left whitespace-normal"
          >
            <span className="text-base font-medium">Continue as Customer</span>
            <span className="text-muted-foreground text-sm font-normal">
              Complete your profile and start using AutoHub as a customer.
            </span>
          </Button>
        </Link>

        <Link href="/onboarding/merchant" className="block">
          <Button
            variant="outline"
            className="h-auto w-full flex-col items-start gap-2 p-4 text-left whitespace-normal"
          >
            <span className="text-base font-medium">Continue as Merchant</span>
            <span className="text-muted-foreground text-sm font-normal">
              Claim an existing business or submit a new merchant onboarding
              request.
            </span>
          </Button>
        </Link>
      </div>
    </OnboardingLayout>
  );
}
