import { PortalLoginScreen } from "@/components/auth/portal-login-screen";

export default function CustomerLoginPage() {
  return (
    <PortalLoginScreen
      portal="customer"
      title="AutoHub"
      description="Book car wash and auto services from the AutoHub LINE Official Account."
      defaultCallbackUrl="/browse"
      errorCallbackURL="/login?error=auth"
    />
  );
}
