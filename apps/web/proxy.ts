import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { PORTALS } from "@/lib/auth/portals";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import {
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
} from "@/lib/service-store/access";

const CUSTOMER_HOME = PORTALS.customer.home;
const SERVICE_STORE_HOME = PORTALS.serviceStore.dashboard;
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

function isCustomerLoginPath(pathname: string): boolean {
  return pathname === PORTALS.customer.loginFallback;
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
  return pathname === "/service-store" || pathname.startsWith("/service-store/");
}

function isAdminAppPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isCustomerAppPath(pathname: string): boolean {
  return (
    pathname === CUSTOMER_HOME ||
    pathname.startsWith("/browse/") ||
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

function isLegacyOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

async function getLinkedServiceStoreAccess(authUserId: string) {
  const identity = await resolveIdentityLink(authUserId);
  if (!isIdentityLinked(identity) || !identity.domainUserId) {
    return null;
  }

  return getServiceStoreAccessState(identity.domainUserId);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Backward compatibility: legacy /merchant routes → /service-store
  if (pathname === "/merchant" || pathname.startsWith("/merchant/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/merchant/, "/service-store");
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
      isCustomerLoginPath(pathname) ||
      isServiceStorePublicPath(pathname) ||
      isAdminPublicPath(pathname)
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

    if (isCustomerAppPath(pathname) || isLegacyOnboardingPath(pathname)) {
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
  let identity = await resolveIdentityLink(session.user.id);
  const onServiceStoreSurface =
    isServiceStoreAppPath(pathname) ||
    isServiceStorePublicPath(pathname) ||
    isLegacyOnboardingPath(pathname);
  const onAdminSurface = isAdminAppPath(pathname) || isAdminPublicPath(pathname);
  const onCustomerSurface =
    isCustomerAppPath(pathname) || isCustomerLoginPath(pathname);

  // Auto-create customer profile on the customer LIFF surface only.
  if (!isIdentityLinked(identity) && onCustomerSurface && !onServiceStoreSurface && !onAdminSurface) {
    try {
      await ensureCustomerProfile({
        authUserId: session.user.id,
        displayName: session.user.name,
        imageUrl: session.user.image,
      });
    } catch {
      return NextResponse.redirect(
        new URL(`${PORTALS.customer.loginFallback}?error=auth`, request.url),
      );
    }

    identity = await resolveIdentityLink(session.user.id);
    if (!isIdentityLinked(identity)) {
      return NextResponse.redirect(
        new URL(`${PORTALS.customer.loginFallback}?error=auth`, request.url),
      );
    }
  }

  const serviceStoreAccess = await getLinkedServiceStoreAccess(session.user.id);

  // Customer fallback login → LIFF home.
  if (isCustomerLoginPath(pathname)) {
    return NextResponse.redirect(new URL(CUSTOMER_HOME, request.url));
  }

  // ServiceStore login / landing / legacy onboarding hub.
  if (
    pathname === PORTALS.serviceStore.login ||
    pathname === SERVICE_STORE_LANDING ||
    isLegacyOnboardingPath(pathname)
  ) {
    if (serviceStoreAccess && isApprovedServiceStore(serviceStoreAccess)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_HOME, request.url));
    }
    if (serviceStoreAccess && isPendingServiceStore(serviceStoreAccess)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_WAITING, request.url));
    }
    if (pathname === PORTALS.serviceStore.login) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const destination =
        callbackUrl && callbackUrl.startsWith("/service-store")
          ? callbackUrl
          : SERVICE_STORE_ONBOARDING;
      return NextResponse.redirect(new URL(destination, request.url));
    }
    if (pathname === SERVICE_STORE_LANDING) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(SERVICE_STORE_ONBOARDING, request.url));
  }

  // ServiceStore onboarding page.
  if (pathname === SERVICE_STORE_ONBOARDING || pathname.startsWith(`${SERVICE_STORE_ONBOARDING}/`)) {
    if (serviceStoreAccess && isApprovedServiceStore(serviceStoreAccess)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_HOME, request.url));
    }
    if (serviceStoreAccess && isPendingServiceStore(serviceStoreAccess)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_WAITING, request.url));
    }
    return NextResponse.next();
  }

  // Admin login → dashboard; /admin landing stays public-style when authed.
  if (pathname === PORTALS.admin.login) {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  // ServiceStore app routes require serviceStore profile (or onboarding / waiting).
  if (isServiceStoreAppPath(pathname)) {
    if (!isIdentityLinked(identity)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_ONBOARDING, request.url));
    }

    if (
      !serviceStoreAccess ||
      (!isApprovedServiceStore(serviceStoreAccess) && !isPendingServiceStore(serviceStoreAccess))
    ) {
      if (pathname === SERVICE_STORE_ONBOARDING) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(SERVICE_STORE_ONBOARDING, request.url));
    }

    if (isPendingServiceStore(serviceStoreAccess) && pathname !== SERVICE_STORE_WAITING) {
      return NextResponse.redirect(new URL(SERVICE_STORE_WAITING, request.url));
    }

    if (
      isApprovedServiceStore(serviceStoreAccess) &&
      (pathname === SERVICE_STORE_WAITING || pathname === SERVICE_STORE_LANDING)
    ) {
      return NextResponse.redirect(new URL(SERVICE_STORE_HOME, request.url));
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
