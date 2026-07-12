import { ServiceStoreOnboardingWizard } from "@/components/onboarding/service-store-onboarding-wizard";
import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { ServiceStoreButtonLink, ServiceStoreCard } from "@/components/service-store/ui";
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

  // No explicit mode -> this is the generic post-login entry point for new
  // users, so present a real choice instead of silently defaulting to claim.
  const requestedMode: "claim" | "create" | undefined =
    params.mode === "create" || params.mode === "request"
      ? "create"
      : params.mode === "claim"
        ? "claim"
        : undefined;

  const callbackPath = requestedMode ? `/app/onboarding?mode=${requestedMode}` : "/app/onboarding";
  const context = await requireServiceStoreOnboardingContext(callbackPath);

  if (!requestedMode) {
    return (
      <ServiceStorePublicLayout
        title="Get started with your Service Store"
        description="Choose how you'd like to bring your business onto AutoHub."
        backHref="/"
      >
        <ServiceStoreCard className="grid gap-3">
          <ServiceStoreButtonLink href="/app/onboarding?mode=claim">
            Claim Existing Store
          </ServiceStoreButtonLink>
          <ServiceStoreButtonLink href="/app/onboarding?mode=create" variant="secondary">
            Create New Store
          </ServiceStoreButtonLink>
        </ServiceStoreCard>
      </ServiceStorePublicLayout>
    );
  }

  const tenants = await listActiveTenants();
  const { firstName, lastName } = splitDisplayName(context.authUserName);

  return (
    <ServiceStorePublicLayout
      title={requestedMode === "claim" ? "Claim your Service Store" : "Create a Service Store"}
      description="Sign in with LINE, find your business on AutoHub or Google Places, then complete setup."
      backHref="/"
    >
      <ServiceStoreCard>
        <ServiceStoreOnboardingWizard
          tenants={tenants}
          defaultFirstName={firstName}
          defaultLastName={lastName}
          defaultEmail={context.authUserEmail}
          defaultMode={requestedMode}
        />
      </ServiceStoreCard>
    </ServiceStorePublicLayout>
  );
}
