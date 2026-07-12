import { ServiceStoreOnboardingWizard } from "@/components/onboarding/service-store-onboarding-wizard";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreCard } from "@/components/service-store/ui";
import { requireServiceStoreOnboardingContext } from "@/lib/onboarding/context";
import { listActiveTenants } from "@/lib/onboarding/queries";

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

function splitDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export default async function ServiceStorePortalOnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const context = await requireServiceStoreOnboardingContext();
  const tenants = await listActiveTenants();
  const { firstName, lastName } = splitDisplayName(context.authUserName);
  const defaultMode = params.mode === "create" || params.mode === "request" ? "create" : "claim";

  return (
    <ServiceStorePublicLayout
      title={defaultMode === "claim" ? "Claim your Service Store" : "Create a Service Store"}
      description="Sign in with LINE, find your business on AutoHub or Google Places, then complete setup."
      backHref="/"
    >
      <ServiceStoreCard>
        <ServiceStoreOnboardingWizard
          tenants={tenants}
          defaultFirstName={firstName}
          defaultLastName={lastName}
          defaultEmail={context.authUserEmail}
          defaultMode={defaultMode}
        />
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}
