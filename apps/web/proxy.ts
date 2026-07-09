import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { isIdentityLinked, resolveIdentityLink } from "@/lib/auth/identity";
import {
  getMerchantAccessState,
  isApprovedMerchant,
  isMerchantUser,
  isPendingMerchant,
} from "@/lib/merchant/access";

const UNAUTHENTICATED_PATHS = ["/login"];

function isIdentityExemptPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  );
}

function isOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

function isMerchantPath(pathname: string): boolean {
  return pathname === "/merchant" || pathname.startsWith("/merchant/");
}

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

async function getLinkedMerchantAccess(authUserId: string) {
  const identity = await resolveIdentityLink(authUserId);
  if (!isIdentityLinked(identity) || !identity.domainUserId) {
    return null;
  }

  const merchantAccess = await getMerchantAccessState(identity.domainUserId);
  return merchantAccess;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthApiPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const identity = await resolveIdentityLink(session.user.id);

  if (!isIdentityLinked(identity)) {
    if (isIdentityExemptPath(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const merchantAccess = await getLinkedMerchantAccess(session.user.id);

  if (isOnboardingPath(pathname) || pathname === "/login") {
    if (merchantAccess && isMerchantUser(merchantAccess)) {
      if (isApprovedMerchant(merchantAccess)) {
        return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
      }

      return NextResponse.redirect(new URL("/merchant/waiting", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (merchantAccess && isMerchantPath(pathname)) {
    if (!isMerchantUser(merchantAccess)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      isPendingMerchant(merchantAccess) &&
      pathname !== "/merchant/waiting"
    ) {
      return NextResponse.redirect(new URL("/merchant/waiting", request.url));
    }

    if (
      isApprovedMerchant(merchantAccess) &&
      (pathname === "/merchant/waiting" || pathname === "/merchant")
    ) {
      return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname === "/dashboard" && merchantAccess && isMerchantUser(merchantAccess)) {
    if (isApprovedMerchant(merchantAccess)) {
      return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/merchant/waiting", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
