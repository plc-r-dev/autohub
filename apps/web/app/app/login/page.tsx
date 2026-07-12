import { ServiceStorePublicLayout } from "@/components/service-store/service-store-public-layout";
import { PortalLoginScreen } from "@/components/auth/portal-login-screen";

export default function ServiceStoreLoginPage() {
  return (
    <ServiceStorePublicLayout
      title="Sign in with LINE"
      description="Access your serviceStore dashboard to manage bookings, branches, services, and billing."
      backHref="/app"
      maxWidth="md"
    >
      <div className="rounded-[28px] border border-[#dce5ee] bg-white p-6 shadow-sm">
        <PortalLoginScreen
          embedded
          portal="serviceStore"
          title="Service Store Portal"
          description="Use your LINE account to continue."
          defaultCallbackUrl="/app/dashboard"
          errorCallbackURL="/app/login?error=auth"
        />
      </div>
    </ServiceStorePublicLayout>
  );
}
