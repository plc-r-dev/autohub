"use client";

import { createAuthClient } from "better-auth/react";
import {
  customSessionClient,
  genericOAuthClient,
} from "better-auth/client/plugins";

const authBaseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

/**
 * Do not import `@/auth` here — that pulls Prisma/pg into the client bundle.
 * Session typing comes from server helpers / Infer on the API side.
 */
export const customerAuthClient = createAuthClient({
  baseURL: authBaseURL,
  basePath: "/api/auth/customer",
  plugins: [genericOAuthClient(), customSessionClient()],
});

export const serviceStoreAuthClient = createAuthClient({
  baseURL: authBaseURL,
  basePath: "/api/auth/store",
  plugins: [genericOAuthClient(), customSessionClient()],
});

/** @deprecated Prefer `serviceStoreAuthClient` — Service Store portal client. */
export const authClient = serviceStoreAuthClient;

export const { signIn, signUp, signOut, useSession, getSession } = serviceStoreAuthClient;
