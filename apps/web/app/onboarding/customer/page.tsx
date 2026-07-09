import { CustomerOnboardingForm } from "@/components/onboarding/customer-onboarding-form";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { requireOnboardingContext } from "@/lib/onboarding/context";
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

export default async function CustomerOnboardingPage() {
  const context = await requireOnboardingContext();
  const tenants = await listActiveTenants();
  const { firstName, lastName } = splitDisplayName(context.authUserName);

  return (
    <OnboardingLayout
      title="Customer onboarding"
      description="Complete your profile to create your AutoHub account."
      backHref="/onboarding"
    >
      <CustomerOnboardingForm
        tenants={tenants}
        defaultFirstName={firstName}
        defaultLastName={lastName}
        defaultEmail={context.authUserEmail}
      />
    </OnboardingLayout>
  );
}
