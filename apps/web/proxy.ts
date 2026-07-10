import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import { ensureCustomerProfile } from "@/lib/customer/ensure-customer-profile";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isPendingMerchant,
} from "@/lib/merchant/access";

const CUSTOMER_HOME = "/browse";
const MERCHANT_HOME = "/merchant/dashboard";
const MERCHANT_WAITING = "/merchant/waiting";
const MERCHANT_ONBOARDING = "/merchant/onboarding";
const MERCHANT_LANDING = "/merchant";
const ADMIN_HOME = "/admin/dashboard";

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

function isCustomerLoginPath(pathname: string): boolean {
  return pathname === "/login";
}

function isMerchantPublicPath(pathname: string): boolean {
  return (
    pathname === MERCHANT_LANDING ||
    pathname === "/merchant/login" ||
    pathname === MERCHANT_ONBOARDING ||
    pathname.startsWith("/merchant/onboarding/")
  );
}

function isAdminPublicPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

function isMerchantAppPath(pathname: string): boolean {
  return pathname === "/merchant" || pathname.startsWith("/merchant/");
}

function isAdminAppPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isCustomerAppPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/browse" ||
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

async function getLinkedMerchantAccess(authUserId: string) {
  const identity = await resolveIdentityLink(authUserId);
  if (!isIdentityLinked(identity) || !identity.domainUserId) {
    return null;
  }

  return getMerchantAccessState(identity.domainUserId);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthApiPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ---- Unauthenticated ----
  if (!session) {
    if (
      isCustomerLoginPath(pathname) ||
      isMerchantPublicPath(pathname) ||
      isAdminPublicPath(pathname)
    ) {
      return NextResponse.next();
    }

    if (isMerchantAppPath(pathname)) {
      const loginUrl = new URL("/merchant/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminAppPath(pathname)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname === "/admin" ? ADMIN_HOME : pathname);
      return NextResponse.redirect(loginUrl);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname === "/" ? CUSTOMER_HOME : pathname,
    );
    return NextResponse.redirect(loginUrl);
  }

  // ---- Authenticated ----
  let identity = await resolveIdentityLink(session.user.id);
  const onMerchantSurface =
    isMerchantAppPath(pathname) ||
    isMerchantPublicPath(pathname) ||
    isLegacyOnboardingPath(pathname);
  const onAdminSurface = isAdminAppPath(pathname) || isAdminPublicPath(pathname);

  // Auto-create customer profile on the customer app surface only.
  if (!isIdentityLinked(identity)) {
    if (onMerchantSurface || onAdminSurface || isCustomerLoginPath(pathname)) {
      if (
        isMerchantPublicPath(pathname) ||
        isAdminPublicPath(pathname) ||
        isCustomerLoginPath(pathname) ||
        isLegacyOnboardingPath(pathname)
      ) {
        return NextResponse.next();
      }

      if (isMerchantAppPath(pathname)) {
        return NextResponse.redirect(new URL(MERCHANT_ONBOARDING, request.url));
      }

      if (isAdminAppPath(pathname)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    try {
      await ensureCustomerProfile({
        authUserId: session.user.id,
        displayName: session.user.name,
        imageUrl: session.user.image,
      });
    } catch {
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }

    identity = await resolveIdentityLink(session.user.id);
    if (!isIdentityLinked(identity)) {
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }
  }

  const merchantAccess = await getLinkedMerchantAccess(session.user.id);

  // Customer login always lands on customer home (merchant profile does not block this).
  if (isCustomerLoginPath(pathname)) {
    return NextResponse.redirect(new URL(CUSTOMER_HOME, request.url));
  }

  // Merchant login / landing / legacy onboarding hub.
  if (
    pathname === "/merchant/login" ||
    pathname === MERCHANT_LANDING ||
    isLegacyOnboardingPath(pathname)
  ) {
    if (merchantAccess && isApprovedMerchant(merchantAccess)) {
      return NextResponse.redirect(new URL(MERCHANT_HOME, request.url));
    }
    if (merchantAccess && isPendingMerchant(merchantAccess)) {
      return NextResponse.redirect(new URL(MERCHANT_WAITING, request.url));
    }
    if (pathname === "/merchant/login") {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const destination =
        callbackUrl && callbackUrl.startsWith("/merchant")
          ? callbackUrl
          : MERCHANT_ONBOARDING;
      return NextResponse.redirect(new URL(destination, request.url));
    }
    if (pathname === MERCHANT_LANDING) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(MERCHANT_ONBOARDING, request.url));
  }

  // Merchant onboarding page.
  if (pathname === MERCHANT_ONBOARDING || pathname.startsWith(`${MERCHANT_ONBOARDING}/`)) {
    if (merchantAccess && isApprovedMerchant(merchantAccess)) {
      return NextResponse.redirect(new URL(MERCHANT_HOME, request.url));
    }
    if (merchantAccess && isPendingMerchant(merchantAccess)) {
      return NextResponse.redirect(new URL(MERCHANT_WAITING, request.url));
    }
    return NextResponse.next();
  }

  // Admin login /admin root.
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  if (pathname === "/admin") {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  // Merchant app routes require a merchant profile (or onboarding / waiting).
  if (isMerchantAppPath(pathname)) {
    if (!isIdentityLinked(identity)) {
      return NextResponse.redirect(new URL(MERCHANT_ONBOARDING, request.url));
    }

    if (!merchantAccess || (!isApprovedMerchant(merchantAccess) && !isPendingMerchant(merchantAccess))) {
      if (pathname === MERCHANT_ONBOARDING) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(MERCHANT_ONBOARDING, request.url));
    }

    if (isPendingMerchant(merchantAccess) && pathname !== MERCHANT_WAITING) {
      return NextResponse.redirect(new URL(MERCHANT_WAITING, request.url));
    }

    if (
      isApprovedMerchant(merchantAccess) &&
      (pathname === MERCHANT_WAITING || pathname === MERCHANT_LANDING)
    ) {
      return NextResponse.redirect(new URL(MERCHANT_HOME, request.url));
    }

    return NextResponse.next();
  }

  // Customer app: customer and merchant profiles may coexist on one identity.
  if (isCustomerAppPath(pathname)) {
    if (pathname === "/" || pathname === "/dashboard") {
      return NextResponse.redirect(new URL(CUSTOMER_HOME, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
