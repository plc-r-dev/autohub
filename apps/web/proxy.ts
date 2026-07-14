import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { customerAuth, serviceStoreAuth } from "@/auth";
import { PORTALS } from "@/lib/auth/portals";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import { ensureServiceStoreUser } from "@/lib/service-store/ensure-service-store-user";
import {
  canEnterServiceStorePortal,
  getServiceStoreAccessState,
  isApprovedServiceStore,
  isPendingServiceStore,
  resolvePostAuthServiceStoreDestination,
  type ServiceStoreAccessState,
} from "@/lib/service-store/access";
import { isServiceStoreCatalogConfigured } from "@/lib/service-store/application/catalog-gate";
import { prisma } from "@/lib/prisma";

const CUSTOMER_HOME = PORTALS.customer.home;
const SERVICE_STORE_LANDING = PORTALS.serviceStore.home;
const ADMIN_HOME = PORTALS.admin.dashboard;
const MARKETING_HOME = PORTALS.marketing.home;
const OPEN_IN_LINE = PORTALS.customer.openInLine;

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

function isInvitePath(pathname: string): boolean {
  return pathname === "/invite" || pathname.startsWith("/invite/");
}

function isMarketingHome(pathname: string): boolean {
  return pathname === MARKETING_HOME;
}

function isCustomerEntryPath(pathname: string): boolean {
  return pathname === OPEN_IN_LINE;
}

function isServiceStorePublicPath(pathname: string): boolean {
  return pathname === PORTALS.serviceStore.login;
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
    pathname.startsWith("/more/")
  );
}

function isLegacyOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = await headers();

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

  // Legacy /dashboard → marketing landing (always).
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(MARKETING_HOME, request.url));
  }

  // Independent portal sessions — never treat one as the other.
  const customerSession = await customerAuth.api.getSession({
    headers: requestHeaders,
  });
  const storeSession = await serviceStoreAuth.api.getSession({
    headers: requestHeaders,
  });

  // ---- Public surfaces (no portal session required) ----
  if (
    isMarketingHome(pathname) ||
    isCustomerEntryPath(pathname) ||
    isInvitePath(pathname) ||
    isServiceStorePublicPath(pathname) ||
    isAdminPublicPath(pathname)
  ) {
    // /app/login still needs the store session to render the chooser; allow
    // through either way (page redirects when missing).
    return NextResponse.next();
  }

  // ---- Customer portal (/browse, bookings, …) ----
  if (isCustomerAppPath(pathname)) {
    if (!customerSession) {
      const entryUrl = new URL(OPEN_IN_LINE, request.url);
      entryUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(entryUrl);
    }

    let identity = await resolveIdentityLink(customerSession.user.id);
    if (!isIdentityLinked(identity)) {
      try {
        await ensureCustomerProfile({
          authUserId: customerSession.user.id,
          displayName: customerSession.user.name,
          imageUrl: customerSession.user.image,
        });
      } catch {
        return NextResponse.redirect(
          new URL(`${OPEN_IN_LINE}?error=auth`, request.url),
        );
      }
      identity = await resolveIdentityLink(customerSession.user.id);
      if (!isIdentityLinked(identity)) {
        return NextResponse.redirect(
          new URL(`${OPEN_IN_LINE}?error=auth`, request.url),
        );
      }
    }

    return NextResponse.next();
  }

  // ---- Service Store portal ----
  if (isServiceStoreAppPath(pathname) || isLegacyOnboardingPath(pathname)) {
    if (!storeSession) {
      const homeUrl = new URL(MARKETING_HOME, request.url);
      // Dashboard session expiry → clean landing (no callback bounce).
      if (pathname === PORTALS.serviceStore.dashboard) {
        return NextResponse.redirect(homeUrl);
      }
      const callbackPath = `${pathname}${request.nextUrl.search}`;
      if (callbackPath !== SERVICE_STORE_LANDING) {
        homeUrl.searchParams.set("callbackUrl", callbackPath);
      }
      return NextResponse.redirect(homeUrl);
    }

    let serviceStoreAccess: ServiceStoreAccessState | null = null
    let domainUserId: string | null = null
    try {
      const ensured = await ensureServiceStoreUser({
        authUserId: storeSession.user.id,
        displayName: storeSession.user.name,
      })
      domainUserId = ensured.domainUserId
      serviceStoreAccess = await getServiceStoreAccessState(domainUserId)
    } catch {
      return NextResponse.redirect(
        new URL(`${MARKETING_HOME}?error=auth`, request.url),
      )
    }

    if (isLegacyOnboardingPath(pathname)) {
      const destination = resolvePostAuthServiceStoreDestination(serviceStoreAccess)
      return NextResponse.redirect(new URL(destination, request.url))
    }

    if (pathname === PORTALS.serviceStore.login) {
      return NextResponse.next()
    }

    // Setup wizard + readiness checklist retired.
    if (
      pathname === "/app/setup" ||
      pathname.startsWith("/app/setup/") ||
      pathname === "/app/readiness"
    ) {
      return NextResponse.redirect(
        new URL(PORTALS.serviceStore.dashboard, request.url),
      )
    }

    const isExactLanding = pathname === SERVICE_STORE_LANDING

    // Bootstrap workspace: empty / pending / store selection / claim|create.
    // Always allow `/app` so users can Open, Claim, or Create from selection.
    if (isExactLanding) {
      if (
        serviceStoreAccess &&
        isApprovedServiceStore(serviceStoreAccess) &&
        serviceStoreAccess.membershipCount === 1 &&
        serviceStoreAccess.serviceStoreId &&
        domainUserId
      ) {
        // Keep the only membership persisted as active (selection still renders).
        await prisma.user.updateMany({
          where: {
            id: domainUserId,
            OR: [
              { serviceStoreId: null },
              { NOT: { serviceStoreId: serviceStoreAccess.serviceStoreId } },
            ],
          },
          data: { serviceStoreId: serviceStoreAccess.serviceStoreId },
        })
      }
      return NextResponse.next()
    }

    if (
      !serviceStoreAccess ||
      isPendingServiceStore(serviceStoreAccess) ||
      !isApprovedServiceStore(serviceStoreAccess)
    ) {
      return NextResponse.redirect(new URL(SERVICE_STORE_LANDING, request.url))
    }

    if (!canEnterServiceStorePortal(serviceStoreAccess)) {
      return NextResponse.redirect(new URL(SERVICE_STORE_LANDING, request.url))
    }

    const activeStoreId = serviceStoreAccess.serviceStoreId
    const isSettingsPath =
      pathname === "/app/settings" || pathname.startsWith("/app/settings/")
    const isCatalogExemptPath =
      isSettingsPath ||
      pathname === SERVICE_STORE_LANDING ||
      pathname === PORTALS.serviceStore.login

    if (activeStoreId && !isCatalogExemptPath) {
      const catalogReady = await isServiceStoreCatalogConfigured(activeStoreId)
      if (!catalogReady) {
        return NextResponse.redirect(new URL("/app/settings", request.url))
      }
    }

    return NextResponse.next()
  }

  // ---- Admin portal (uses store session for now) ----
  if (isAdminAppPath(pathname)) {
    if (!storeSession) {
      const loginUrl = new URL(PORTALS.admin.login, request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        pathname === PORTALS.admin.home ? ADMIN_HOME : pathname,
      );
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === PORTALS.admin.login) {
      return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
