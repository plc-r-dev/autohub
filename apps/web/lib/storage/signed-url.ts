import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_SIGNING_SECRET = "autohub-dev-storage-secret";

export function getStorageSigningSecret(): string {
  return process.env.STORAGE_SIGNING_SECRET ?? DEFAULT_SIGNING_SECRET;
}

export function signStorageKey(key: string, expiresAt: number): string {
  return createHmac("sha256", getStorageSigningSecret())
    .update(`${key}:${expiresAt}`)
    .digest("hex");
}

export function verifyStorageSignature(
  key: string,
  expiresAt: number,
  signature: string,
): boolean {
  if (!signature || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = signStorageKey(key, expiresAt);
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function buildSignedStorageUrl(
  key: string,
  expiresInSeconds = 3600,
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const signature = signStorageKey(key, expiresAt);
  const params = new URLSearchParams({
    key,
    expires: String(expiresAt),
    sig: signature,
  });

  return `/api/storage/signed?${params.toString()}`;
}
