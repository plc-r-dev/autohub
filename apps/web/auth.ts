import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, genericOAuth, line } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { resolveIdentityLink } from "@/lib/auth/identity";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
  plugins: [
    genericOAuth({
      config: [
        {
          ...line({
            providerId: "line",
            clientId: process.env.LINE_CHANNEL_ID!,
            clientSecret: process.env.LINE_CHANNEL_SECRET!,
            pkce: true,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/line`,
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
  // TEMPORARY DEBUG LOGGING — added to diagnose the 500 on POST /api/auth/sign-in/oauth2.
  // Better Auth's default error response collapses the real error into a generic
  // INTERNAL_SERVER_ERROR before it reaches the client or the dev log. This hook
  // logs the raw error (name/message/code/meta/stack) as it actually occurs.
  // Remove once the root cause is confirmed and fixed.
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
        console.error("[auth-debug] Better Auth API error:", JSON.stringify(details, null, 2));
      } catch {
        console.error("[auth-debug] Better Auth API error (raw, unserializable):", error);
      }
    },
  },
});

export type Session = typeof auth.$Infer.Session;
