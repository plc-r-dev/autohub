/** LIFF runtime context — populated by future LIFF SDK integration. */
export type LiffRuntimeContext = {
  /** Whether the page is opened inside the LINE in-app browser. */
  isInClient: boolean;
  /** Whether the user is logged in via LIFF. */
  isLoggedIn: boolean;
  /** LINE user ID from LIFF profile (when available). */
  lineUserId: string | null;
  /** LIFF OS context (ios | android | web). */
  os: "ios" | "android" | "web" | null;
  /** LIFF language tag. */
  language: string | null;
};

export const DEFAULT_LIFF_CONTEXT: LiffRuntimeContext = {
  isInClient: false,
  isLoggedIn: false,
  lineUserId: null,
  os: null,
  language: null,
};
