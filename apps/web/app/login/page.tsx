import { PortalLoginScreen } from "@/components/auth/portal-login-screen";
import { PORTALS } from "@/lib/auth/portals";

/**
 * Customer web login — development / fallback only.
 * Primary customer entry is LINE OA → LIFF (see /open-in-line).
 */
export default function CustomerLoginFallbackPage() {
  return (
    <PortalLoginScreen
      portal="customer"
      title="Developer login"
      description="Customer access is LINE-first. Use this page only for local development or testing outside LINE."
      defaultCallbackUrl={PORTALS.customer.home}
      errorCallbackURL={`${PORTALS.customer.loginFallback}?error=auth`}
    />
  );
}
