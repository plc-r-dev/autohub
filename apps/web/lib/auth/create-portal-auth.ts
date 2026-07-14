import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, genericOAuth, line } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { resolveIdentityLink } from "@/lib/auth/identity";
import { prisma } from "@/lib/prisma";

type CreatePortalAuthOptions = {
  cookiePrefix: string;
  basePath: string;
};

/**
 * Portal-scoped Better Auth instance. Customer and Service Store keep
 * independent session cookies so signing into one portal never authenticates
 * the other.
 *
 * LINE OAuth uses a shared callback (`/api/auth/callback/line`) so only one
 * redirect URI must be registered in the LINE Developers console. The bridge
 * route rewrites to the portal handler using the `ah-oauth-portal` cookie.
 */
export function createPortalAuth(options: CreatePortalAuthOptions) {
  const baseURL = process.env.BETTER_AUTH_URL!;

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: options.basePath,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: false,
    },
    user: {
      modelName: "authUser",
    },
    account: {
      modelName: "authAccount",
    },
    verification: {
      modelName: "authVerification",
    },
    session: {
      modelName: "authSession",
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      cookiePrefix: options.cookiePrefix,
    },
    plugins: [
      genericOAuth({
        config: [
          {
            ...line({
              providerId: "line",
              clientId: process.env.LINE_CHANNEL_ID!,
              clientSecret: process.env.LINE_CHANNEL_SECRET!,
              pkce: true,
              // Shared with both portals — must match LINE Developers callback URL.
              redirectURI: `${baseURL}/api/auth/callback/line`,
            }),
            mapProfileToUser(profile) {
              const lineUserId = String(profile.id ?? profile.sub ?? "");
              return {
                id: lineUserId,
                name: profile.name ?? "LINE User",
                email: profile.email ?? `${lineUserId}@line.autohub.local`,
                image: profile.image,
                emailVerified: false,
              };
            },
          },
        ],
      }),
      customSession(async ({ user, session }) => {
        const identity = await resolveIdentityLink(user.id);

        return {
          user: {
            ...user,
            domainUserId: identity.domainUserId,
          },
          session,
          identity,
        };
      }),
      nextCookies(),
    ],
    onAPIError: {
      onError(error) {
        const err = error as {
          name?: string;
          message?: string;
          code?: unknown;
          meta?: unknown;
          stack?: unknown;
          cause?: unknown;
        };
        const details = {
          name: err?.name ?? (error instanceof Error ? error.name : typeof error),
          message: err?.message ?? String(error),
          code: err?.code,
          meta: err?.meta,
          cause: err?.cause,
          stack: err?.stack,
        };
        try {
          console.error(
            `[auth-debug:${options.cookiePrefix}] Better Auth API error:`,
            JSON.stringify(details, null, 2),
          );
        } catch {
          console.error(
            `[auth-debug:${options.cookiePrefix}] Better Auth API error (raw):`,
            error,
          );
        }
      },
    },
  });
}

export type PortalAuth = ReturnType<typeof createPortalAuth>;
export type PortalSession = PortalAuth["$Infer"]["Session"];
