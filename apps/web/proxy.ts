import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { PORTALS } from "@/lib/auth/portals";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import { ensureServiceStoreUser } from "@/lib/service-store/ensure-service-store-user";
import {
  getServiceStoreAccessState,
  resolvePostAuthServiceStoreDestination,
  type ServiceStoreAccessState,
} from "@/lib/service-store/access";

const CUSTOMER_HOME = PORTALS.customer.home;
const SERVICE_STORE_WAITING = PORTALS.serviceStore.waiting;
const SERVICE_STORE_ONBOARDING = PORTALS.serviceStore.onboarding;
const SERVICE_STORE_LANDING = PORTALS.serviceStore.home;
const ADMIN_HOME = PORTALS.admin.dashboard;
const MARKETING_HOME = PORTALS.marketing.home;
const OPEN_IN_LINE = PORTALS.customer.openInLine;

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

function isMarketingPath(pathname: string): boolean {
  return pathname === MARKETING_HOME || pathname === OPEN_IN_LINE;
}

function isServiceStorePublicPath(pathname: string): boolean {
  return (
    pathname === SERVICE_STORE_LANDING ||
    pathname === PORTALS.serviceStore.login ||
    pathname === SERVICE_STORE_ONBOARDING ||
    pathname.startsWith(`${SERVICE_STORE_ONBOARDING}/`)
  );
}

function isAdminPublicPath(pathname: string): boolean {
  return pathname === PORTALS.admin.login || pathname === PORTALS.admin.home;
}

function isServiceStoreAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isAdminAppPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

// Browsing requires no customer identity — anyone can view Service Stores
// and Services. Only actions that need to know "who" (booking, my bookings,
// vehicles, profile/loyalty) require a LINE-authenticated session.
function isPublicCustomerPath(pathname: string): boolean {
  return pathname === CUSTOMER_HOME || pathname.startsWith("/browse/");
}

function isProtectedCustomerPath(pathname: string): boolean {
  return (
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/vehicles" ||
    pathname.startsWith("/vehicles/") ||
    pathname === "/more" ||
    pathname.startsWith("/more/") ||
    pathname === "/dashboard"
  );
}

function isCustomerAppPath(pathname: string): boolean {
  return isPublicCustomerPath(pathname) || isProtectedCustomerPath(pathname);
}

function isLegacyOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Backward compatibility: legacy /merchant routes → /app
  if (pathname === "/merchant" || pathname.startsWith("/merchant/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/merchant/, "/app");
    return NextResponse.redirect(url);
  }

  if (pathname === "/onboarding/merchant" || pathname.startsWith("/onboarding/merchant/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/onboarding/merchant", PORTALS.serviceStore.onboarding);
    return NextResponse.redirect(url);
  }

  if (isAuthApiPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ---- Unauthenticated ----
  if (!session) {
    if (
      isMarketingPath(pathname) ||
      isServiceStorePublicPath(pathname) ||
      isAdminPublicPath(pathname) ||
      isPublicCustomerPath(pathname)
    ) {
      return NextResponse.next();
    }

    if (isServiceStoreAppPath(pathname)) {
      const loginUrl = new URL(PORTALS.serviceStore.login, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminAppPath(pathname)) {
      const loginUrl = new URL(PORTALS.admin.login, request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        pathname === PORTALS.admin.home ? ADMIN_HOME : pathname,
      );
      return NextResponse.redirect(loginUrl);
    }

    if (isProtectedCustomerPath(pathname) || isLegacyOnboardingPath(pathname)) {
      const entryUrl = new URL(OPEN_IN_LINE, request.url);
      entryUrl.searchParams.set(
        "callbackUrl",
        pathname === "/dashboard" ? CUSTOMER_HOME : pathname,
      );
      return NextResponse.redirect(entryUrl);
    }

    return NextResponse.next();
  }

  // ---- Authenticated ----
  // Authentication stops here: `session` only proves who the user is, not
  // what they can access in any given portal.
  let identity = await resolveIdentityLink(session.user.id);
  const onServiceStoreSurface =
    isServiceStoreAppPath(pathname) ||
    isServiceStorePublicPath(pathname) ||
    isLegacyOnboardingPath(pathname);
  const onAdminSurface = isAdminAppPath(pathname) || isAdminPublicPath(pathname);
  const onCustomerSurface = isCustomerAppPath(pathname);

  // Customer Portal authorization: auto-create the Customer profile on the
  // customer LIFF surface only.
  if (!isIdentityLinked(identity) && onCustomerSurface && !onServiceStoreSurface && !onAdminSurface) {
    try {
      await ensureCustomerProfile({
        authUserId: session.user.id,
        displayName: session.user.name,
        imageUrl: session.user.image,
      });
    } catch {
      return NextResponse.redirect(
        new URL(`${PORTALS.customer.openInLine}?error=auth`, request.url),
      );
    }

    identity = await resolveIdentityLink(session.user.id);
    if (!isIdentityLinked(identity)) {
      return NextResponse.redirect(
        new URL(`${PORTALS.customer.openInLine}?error=auth`, request.url),
      );
    }
  }

  // Service Store Portal authorization — independent of the Customer flow
  // above and never inferred from the session's mere existence. Entering the
  // Service Store surface always (re)loads the domain user, then resolves
  // membership, pending applications, and onboarding state fresh from
  // Service Store data.
  let serviceStoreAccess: ServiceStoreAccessState | null = null;
  if (onServiceStoreSurface && !onCustomerSurface && !onAdminSurface) {
    try {
      const { domainUserId } = await ensureServiceStoreUser({
        authUserId: session.user.id,
        displayName: session.user.name,
      });
      serviceStoreAccess = await getServiceStoreAccessState(domainUserId);
    } catch {
      return NextResponse.redirect(
        new URL(`${PORTALS.serviceStore.login}?error=auth`, request.url),
      );
    }
  }

  // ServiceStore login / landing / legacy onboarding hub.
  if (
    pathname === PORTALS.serviceStore.login ||
    pathname === SERVICE_STORE_LANDING ||
    isLegacyOnboardingPath(pathname)
  ) {
    const destination = resolvePostAuthServiceStoreDestination(serviceStoreAccess);

    if (destination !== SERVICE_STORE_ONBOARDING) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
    if (pathname === PORTALS.serviceStore.login) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const loginDestination =
        callbackUrl && callbackUrl.startsWith("/app") ? callbackUrl : destination;
      return NextResponse.redirect(new URL(loginDestination, request.url));
    }
    if (pathname === SERVICE_STORE_LANDING) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ServiceStore onboarding page.
  if (pathname === SERVICE_STORE_ONBOARDING || pathname.startsWith(`${SERVICE_STORE_ONBOARDING}/`)) {
    const destination = resolvePostAuthServiceStoreDestination(serviceStoreAccess);
    if (destination !== SERVICE_STORE_ONBOARDING) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Admin login → dashboard; /admin landing stays public-style when authed.
  if (pathname === PORTALS.admin.login) {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  // ServiceStore app routes require serviceStore profile (or onboarding / waiting).
  if (isServiceStoreAppPath(pathname)) {
    const destination = resolvePostAuthServiceStoreDestination(serviceStoreAccess);

    if (destination === SERVICE_STORE_ONBOARDING) {
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (destination === SERVICE_STORE_WAITING) {
      if (pathname !== SERVICE_STORE_WAITING) {
        return NextResponse.redirect(new URL(destination, request.url));
      }
      return NextResponse.next();
    }

    // Approved: only steer away from the waiting/landing pages; other app pages pass through.
    if (pathname === SERVICE_STORE_WAITING || pathname === SERVICE_STORE_LANDING) {
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  // Customer LIFF surface — customer and serviceStore profiles may coexist.
  if (isCustomerAppPath(pathname)) {
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(CUSTOMER_HOME, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
