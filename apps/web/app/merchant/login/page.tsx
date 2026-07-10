import { PortalLoginScreen } from "@/components/auth/portal-login-screen";

export default function MerchantLoginPage() {
  return (
    <PortalLoginScreen
      portal="merchant"
      title="Merchant Portal"
      description="Sign in with LINE to manage bookings, customers, and billing."
      defaultCallbackUrl="/merchant/dashboard"
      errorCallbackURL="/merchant/login?error=auth"
    />
  );
}
