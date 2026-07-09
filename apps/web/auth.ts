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
        line({
          providerId: "line",
          clientId: process.env.LINE_CHANNEL_ID!,
          clientSecret: process.env.LINE_CHANNEL_SECRET!,
          pkce: true,
        }),
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
});

export type Session = typeof auth.$Infer.Session;
