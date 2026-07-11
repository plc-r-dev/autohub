import { headers } from "next/headers";
import { DEFAULT_LIFF_CONTEXT, type LiffRuntimeContext } from "@/lib/liff/types";

const LIFF_CLIENT_HEADER = "x-autohub-liff-client";

/**
 * Server-side LIFF context detection (architecture stub).
 * Future: set header from LIFF provider or edge middleware after SDK init.
 */
export async function getLiffRuntimeContext(): Promise<LiffRuntimeContext> {
  const headerStore = await headers();
  const isInClient = headerStore.get(LIFF_CLIENT_HEADER) === "1";

  if (!isInClient) {
    return DEFAULT_LIFF_CONTEXT;
  }

  return {
    ...DEFAULT_LIFF_CONTEXT,
    isInClient: true,
    isLoggedIn: true,
  };
}

export { LIFF_CLIENT_HEADER };
