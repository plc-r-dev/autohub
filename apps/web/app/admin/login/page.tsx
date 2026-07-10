import { PortalLoginScreen } from "@/components/auth/portal-login-screen";

export default function AdminLoginPage() {
  return (
    <PortalLoginScreen
      portal="admin"
      title="Admin Portal"
      description="Platform administration for AutoHub."
      defaultCallbackUrl="/admin/dashboard"
      errorCallbackURL="/admin/login?error=auth"
    />
  );
}
