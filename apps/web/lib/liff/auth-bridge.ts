/**
 * Application port for future LIFF ID-token → session exchange.
 * DO NOT implement LIFF SDK here — define the contract only.
 */
export type LiffAuthBridgeInput = {
  idToken: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
};

export type LiffAuthBridgeResult = {
  sessionEstablished: boolean;
  redirectTo: string;
};

export interface LiffAuthBridge {
  exchangeIdToken(input: LiffAuthBridgeInput): Promise<LiffAuthBridgeResult>;
}

/** Stub implementation — replace when LIFF SDK is integrated. */
export const liffAuthBridge: LiffAuthBridge = {
  async exchangeIdToken(_input) {
    throw new Error("LIFF_AUTH_BRIDGE_NOT_IMPLEMENTED");
  },
};
