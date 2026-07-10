import { MerchantOnboardingForm } from "@/components/onboarding/merchant-onboarding-form";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { requireMerchantOnboardingContext } from "@/lib/onboarding/context";
import { listActiveTenants } from "@/lib/onboarding/queries";

function splitDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export default async function MerchantPortalOnboardingPage() {
  const context = await requireMerchantOnboardingContext();
  const tenants = await listActiveTenants();
  const { firstName, lastName } = splitDisplayName(context.authUserName);

  return (
    <OnboardingLayout
      title="Merchant onboarding"
      description="Complete your profile, then claim an existing business or request a new one."
      backHref="/merchant"
    >
      <MerchantOnboardingForm
        tenants={tenants}
        defaultFirstName={firstName}
        defaultLastName={lastName}
        defaultEmail={context.authUserEmail}
      />
    </OnboardingLayout>
  );
}
