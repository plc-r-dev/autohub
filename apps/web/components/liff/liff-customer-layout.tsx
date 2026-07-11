import { CustomerRouteChrome } from "@/components/customer/customer-route-chrome";
import { LiffProvider } from "@/components/liff/liff-provider";
import { getLiffRuntimeContext } from "@/lib/liff/runtime";

type LiffCustomerLayoutProps = {
  children: React.ReactNode;
};

/**
 * Customer route-group layout — LINE-first surface.
 * Provides the LIFF context provider and the responsive chrome (desktop
 * top nav, mobile bottom tab bar) via CustomerRouteChrome.
 */
export async function LiffCustomerLayout({ children }: LiffCustomerLayoutProps) {
  const liffContext = await getLiffRuntimeContext();

  return (
    <LiffProvider initialContext={liffContext}>
      <CustomerRouteChrome>{children}</CustomerRouteChrome>
    </LiffProvider>
  );
}
