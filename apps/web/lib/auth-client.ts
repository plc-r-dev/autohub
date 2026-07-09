"use client";

import type { auth } from "@/auth";
import { createAuthClient } from "better-auth/react";
import {
  customSessionClient,
  genericOAuthClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [genericOAuthClient(), customSessionClient<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
