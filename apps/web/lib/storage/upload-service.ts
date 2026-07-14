import { randomUUID } from "crypto";
import { getStorageProvider } from "@/lib/storage";
import { buildSignedStorageUrl } from "@/lib/storage/signed-url";
import {
  buildClaimDocumentKey,
  buildOnboardingRequestDocumentKey,
  buildPaymentSlipKey,
  buildStoreDocumentKey,
  validateUploadFile,
} from "@/lib/storage/validation";

type UploadedFileMeta = {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export async function uploadPaymentSlipFile(input: {
  billingId: string;
  paymentId: string;
  file: File;
}): Promise<{
  slipKey: string;
  slipUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  validateUploadFile(input.file);

  const paymentId = input.paymentId || randomUUID();
  const slipKey = buildPaymentSlipKey(
    input.billingId,
    paymentId,
    input.file.name,
  );
  const body = new Uint8Array(await input.file.arrayBuffer());
  const provider = await getStorageProvider();
  const result = await provider.upload({
    key: slipKey,
    body,
    contentType: input.file.type || "application/octet-stream",
    fileName: input.file.name,
  });

  return {
    slipKey: result.key,
    slipUrl: result.url,
    fileName: input.file.name,
    fileSize: result.fileSize,
    mimeType: input.file.type || "application/octet-stream",
  };
}

export async function uploadClaimDocumentFile(input: {
  claimId: string;
  kind: "citizen-id" | "company-document";
  file: File;
}): Promise<UploadedFileMeta> {
  validateUploadFile(input.file);

  const key = buildClaimDocumentKey(
    input.claimId,
    input.kind,
    input.file.name,
  );
  const body = new Uint8Array(await input.file.arrayBuffer());
  const provider = await getStorageProvider();
  const result = await provider.upload({
    key,
    body,
    contentType: input.file.type || "application/octet-stream",
    fileName: input.file.name,
  });

  return {
    key: result.key,
    url: result.url,
    fileName: input.file.name,
    fileSize: result.fileSize,
    mimeType: input.file.type || "application/octet-stream",
  };
}

export async function uploadStoreDocumentFile(input: {
  serviceStoreId: string;
  kind: "citizen-id" | "company-document";
  file: File;
}): Promise<UploadedFileMeta> {
  validateUploadFile(input.file);

  const key = buildStoreDocumentKey(
    input.serviceStoreId,
    input.kind,
    input.file.name,
  );
  const body = new Uint8Array(await input.file.arrayBuffer());
  const provider = await getStorageProvider();
  const result = await provider.upload({
    key,
    body,
    contentType: input.file.type || "application/octet-stream",
    fileName: input.file.name,
  });

  return {
    key: result.key,
    url: result.url,
    fileName: input.file.name,
    fileSize: result.fileSize,
    mimeType: input.file.type || "application/octet-stream",
  };
}

export async function uploadOnboardingRequestDocumentFile(input: {
  requestId: string;
  kind: "citizen-id" | "company-document";
  file: File;
}): Promise<UploadedFileMeta> {
  validateUploadFile(input.file);

  const key = buildOnboardingRequestDocumentKey(
    input.requestId,
    input.kind,
    input.file.name,
  );
  const body = new Uint8Array(await input.file.arrayBuffer());
  const provider = await getStorageProvider();
  const result = await provider.upload({
    key,
    body,
    contentType: input.file.type || "application/octet-stream",
    fileName: input.file.name,
  });

  return {
    key: result.key,
    url: result.url,
    fileName: input.file.name,
    fileSize: result.fileSize,
    mimeType: input.file.type || "application/octet-stream",
  };
}

export async function deleteStoredFile(key: string): Promise<void> {
  const provider = await getStorageProvider();
  await provider.delete(key);
}

export async function getStoredFileSignedUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  if (!key || key.startsWith("legacy/")) {
    return "";
  }

  const provider = await getStorageProvider();
  return provider.getSignedUrl(key, expiresInSeconds);
}

export async function getPaymentSlipPreviewUrl(slipKey: string): Promise<string> {
  if (!slipKey || slipKey.startsWith("legacy/")) {
    return "";
  }

  return buildSignedStorageUrl(slipKey, 3600);
}
