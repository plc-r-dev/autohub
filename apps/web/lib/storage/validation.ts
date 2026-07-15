const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".pdf"]);

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  if (index === -1) {
    return "";
  }
  return fileName.slice(index).toLowerCase();
}

export function validateUploadFile(file: File): void {
  if (file.size === 0) {
    throw new UploadValidationError("File is empty.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("File must be 5 MB or less.");
  }

  const extension = getExtension(file.name);
  const mimeAllowed = ALLOWED_MIME_TYPES.has(file.type.toLowerCase());
  const extensionAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (!mimeAllowed && !extensionAllowed) {
    throw new UploadValidationError("Only JPG, JPEG, PNG, and PDF files are allowed.");
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildPaymentSlipKey(
  billingId: string,
  paymentId: string,
  fileName: string,
): string {
  const safeName = sanitizeFileName(fileName);
  return `payment-slips/${billingId}/${paymentId}/${safeName}`;
}

export function buildClaimDocumentKey(
  claimId: string,
  kind: "citizen-id" | "company-document",
  fileName: string,
): string {
  const safeName = sanitizeFileName(fileName);
  return `claims/${claimId}/${kind}/${safeName}`;
}

export function buildStoreDocumentKey(
  serviceStoreId: string,
  kind: "citizen-id" | "company-document",
  fileName: string,
): string {
  const safeName = sanitizeFileName(fileName);
  return `stores/${serviceStoreId}/documents/${kind}/${safeName}`;
}

export function buildOnboardingRequestDocumentKey(
  requestId: string,
  kind: "citizen-id" | "company-document" | "logo",
  fileName: string,
): string {
  const safeName = sanitizeFileName(fileName);
  return `onboarding-requests/${requestId}/${kind}/${safeName}`;
}

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function validateImageUploadFile(file: File): void {
  if (file.size === 0) {
    throw new UploadValidationError("File is empty.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("File must be 5 MB or less.");
  }

  const extension = getExtension(file.name);
  const mimeAllowed = IMAGE_MIME_TYPES.has(file.type.toLowerCase());
  const extensionAllowed = IMAGE_EXTENSIONS.has(extension);

  if (!mimeAllowed && !extensionAllowed) {
    throw new UploadValidationError("Only JPG, PNG, and WebP images are allowed.");
  }
}

export function buildStoreMediaKey(
  serviceStoreId: string,
  kind: "logo" | "cover" | "gallery" | "service",
  fileName: string,
  serviceId?: string,
): string {
  const safeName = sanitizeFileName(fileName);
  if (kind === "service" && serviceId) {
    return `stores/${serviceStoreId}/services/${serviceId}/${safeName}`;
  }
  return `stores/${serviceStoreId}/${kind}/${safeName}`;
}
