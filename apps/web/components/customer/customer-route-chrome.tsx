"use client";

import { usePathname } from "next/navigation";
import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { CustomerBottomNav } from "@/components/customer/customer-bottom-nav";

/**
 * Routes that use their own focused, chrome-free flow (booking wizard,
 * booking detail, service selection, adding a vehicle) — same rule for
 * both the desktop top nav and the mobile bottom tab bar, since both are
 * "site chrome" that would distract from a single-purpose flow.
 */
function shouldHideNav(pathname: string): boolean {
  if (pathname.startsWith("/bookings/new")) {
    return true;
  }
  if (/^\/bookings\/AH-/.test(pathname)) {
    return true;
  }
  if (pathname.startsWith("/vehicles/new")) {
    return true;
  }
  if (/^\/browse\/[^/]+\/branches\//.test(pathname)) {
    return true;
  }
  return false;
}

export function CustomerRouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = shouldHideNav(pathname);

  return (
    <>
      {hideNav ? null : (
        <div className="hidden md:block">
          <CustomerTopNav />
        </div>
      )}
      <div className={hideNav ? "" : "pb-20 md:pb-0"}>{children}</div>
      {hideNav ? null : <CustomerBottomNav />}
    </>
  );
}
