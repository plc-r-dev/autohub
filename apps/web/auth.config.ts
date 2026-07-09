import type { NextAuthConfig } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";

const LineProvider: OAuthConfig<Record<string, unknown>> = {
  id: "line",
  name: "LINE",
  type: "oauth",
  issuer: "https://access.line.me",
  authorization: {
    url: "https://access.line.me/oauth2/v2.1/authorize",
    params: {
      scope: "openid profile email",
    },
  },
  token: "https://api.line.me/oauth2/v2.1/token",
  userinfo: "https://api.line.me/v2/profile",
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
  checks: ["state", "pkce"],
  profile(profile) {
    return {
      id: profile.userId as string,
      name: profile.displayName as string,
      image: profile.pictureUrl as string | undefined,
      email: null,
    };
  },
};

export default {
  session: {
    strategy: "jwt",
  },
  providers: [LineProvider],
} satisfies NextAuthConfig;