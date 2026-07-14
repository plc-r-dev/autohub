import { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { customerAuth, serviceStoreAuth } from "@/auth";
import { OAUTH_PORTAL_COOKIE } from "@/lib/auth/oauth-portal";

const customerHandler = toNextJsHandler(customerAuth);
const storeHandler = toNextJsHandler(serviceStoreAuth);

/**
 * Shared LINE OAuth callback (registered in LINE Developers).
 * Invokes the portal-specific Better Auth handler so customer/store keep
 * separate cookies while sharing one redirect URI.
 *
 * Note: `NextResponse.rewrite` from a route handler does not reliably run
 * another App Router API route — call the handler directly instead.
 */
export async function GET(request: NextRequest) {
  const portal = request.cookies.get(OAUTH_PORTAL_COOKIE)?.value;
  const isStore = portal === "serviceStore" || portal === "store";
  const basePath = isStore ? "/api/auth/store" : "/api/auth/customer";
  const handler = isStore ? storeHandler : customerHandler;

  const url = request.nextUrl.clone();
  url.pathname = `${basePath}/callback/line`;

  const forwarded = new NextRequest(url, {
    headers: request.headers,
    method: "GET",
  });

  return handler.GET(forwarded);
}
