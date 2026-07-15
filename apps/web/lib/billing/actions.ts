"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { requireAdminSession } from "@/lib/auth/require-admin";
import {
  canReviewBillingPayment,
  canSubmitBillingPayment,
} from "@/lib/billing/domain";
import { generateReceiptNumber } from "@/lib/billing/numbering";
import { formatBillingDate } from "@/lib/billing/format";
import {
  getAdminBillingDetail,
  getBillingGenerationEstimate,
  type BillingGenerationEstimate,
} from "@/lib/billing/queries";
import {
  billingGenerationSchema,
  rejectBillingSchema,
  uploadPaymentSlipSchema,
} from "@/lib/billing/schemas";
import { generateBillingsForPeriod } from "@/lib/billing/service";
import {
  sendBillingGenerated,
  sendPaymentApproved,
} from "@/lib/line/line-notification-service";
import { getPlatformSettings } from "@/lib/platform-settings/queries";
import { prisma } from "@/lib/prisma";
import {
  getPaymentSlipPreviewUrl,
  uploadPaymentSlipFile,
} from "@/lib/storage/upload-service";
import { UploadValidationError } from "@/lib/storage/validation";

export type BillingActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function revalidateBillingPaths(billingId: string) {
  revalidatePath("/app/billings");
  revalidatePath(`/app/billings/${billingId}`);
  revalidatePath("/app/dashboard");
  revalidatePath("/admin/billings");
  revalidatePath("/admin/billings/payment-review");
  revalidatePath("/admin/billings/history");
  revalidatePath(`/admin/billings/${billingId}`);
}

async function assertAdminReviewer() {
  await requireAdminSession();
}

export async function generateMonthlyBilling(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await assertAdminReviewer();
  } catch {
    return { error: "Unauthorized." };
  }

  const parsed = billingGenerationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const periodStart = new Date(parsed.data.periodStart);
  const periodEnd = new Date(parsed.data.periodEnd);

  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return { error: "Billing period is invalid." };
  }

  if (periodStart > periodEnd) {
    return { error: "Period start must be before period end." };
  }

  const result = await generateBillingsForPeriod({
    periodStart,
    periodEnd,
  });

  revalidatePath("/admin/billings");
  revalidatePath("/app/billings");

  if (result.createdBillings.length > 0) {
    const serviceStoreIds = [
      ...new Set(result.createdBillings.map((row) => row.serviceStoreId)),
    ];
    const [users, billings] = await Promise.all([
      prisma.user.findMany({
        where: {
          serviceStoreId: { in: serviceStoreIds },
          lineUserId: { not: null },
        },
        select: {
          serviceStoreId: true,
          lineUserId: true,
        },
      }),
      prisma.billing.findMany({
        where: { id: { in: result.createdBillings.map((row) => row.id) } },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          serviceStore: { select: { id: true, name: true } },
        },
      }),
    ]);

    const usersByServiceStore = new Map<string, string[]>();
    for (const user of users) {
      if (!user.serviceStoreId || !user.lineUserId) {
        continue;
      }
      const rows = usersByServiceStore.get(user.serviceStoreId) ?? [];
      rows.push(user.lineUserId);
      usersByServiceStore.set(user.serviceStoreId, rows);
    }

    for (const billing of billings) {
      const recipients = usersByServiceStore.get(billing.serviceStore.id) ?? [];
      for (const recipientLineUserId of recipients) {
        await sendBillingGenerated({
          recipientLineUserId,
          billingId: billing.id,
          billingNumber: billing.invoiceNumber ?? billing.id,
          serviceStoreName: billing.serviceStore.name,
          status: billing.status.replaceAll("_", " "),
        });
      }
    }
  }

  return {
    success: `Generated ${result.createdCount} billings, skipped ${result.skippedCount} existing.`,
  };
}

export async function uploadBillingPaymentSlip(
  billingId: string,
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const { serviceStore } = await requireApprovedServiceStoreUser();

  const billing = await prisma.billing.findFirst({
    where: { id: billingId, serviceStoreId: serviceStore.id },
    select: {
      id: true,
      status: true,
      total: true,
      bookingFee: true,
      bookingCount: true,
    },
  });

  if (!billing) {
    return { error: "Billing not found." };
  }

  if (!canSubmitBillingPayment(billing.status)) {
    return {
      error: "Payment can only be submitted for pending or rejected billings.",
    };
  }

  const parsed = uploadPaymentSlipSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const fileValue = formData.get("slipFile");
  if (!(fileValue instanceof File)) {
    return { error: "Payment slip file is required." };
  }

  const paymentDate = new Date(parsed.data.paymentDate);
  if (Number.isNaN(paymentDate.getTime())) {
    return { fieldErrors: { paymentDate: ["Payment date is invalid."] } };
  }

  const platformSettings = await getPlatformSettings();
  const bank =
    platformSettings.bankName.trim() ||
    platformSettings.companyName.trim() ||
    "AutoHub";

  const paymentId = randomUUID();
  const amountDue = billing.bookingFee.mul(billing.bookingCount);

  let uploadResult;
  try {
    uploadResult = await uploadPaymentSlipFile({
      billingId: billing.id,
      paymentId,
      file: fileValue,
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  // Platform booking fee is VAT-inclusive — due amount is fee × bookings.
  await prisma.$transaction(async (tx) => {
    await tx.billingPayment.create({
      data: {
        id: paymentId,
        billingId: billing.id,
        paymentDate,
        amount: amountDue,
        bank,
        referenceNumber: parsed.data.referenceNumber,
        slipKey: uploadResult.slipKey,
        slipUrl: uploadResult.slipUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        reviewStatus: "PENDING",
      },
    });

    await tx.billing.update({
      where: { id: billing.id },
      data: {
        status: "PAYMENT_SUBMITTED",
        paymentSubmittedAt: new Date(),
        rejectedAt: null,
        rejectReason: null,
        total: amountDue,
      },
    });
  });

  revalidateBillingPaths(billing.id);
  return { success: "Payment submitted for review." };
}

export async function approveBillingPaymentAsAdmin(
  billingId: string,
  paymentId: string,
): Promise<BillingActionState> {
  try {
    await assertAdminReviewer();
  } catch {
    return { error: "Unauthorized." };
  }

  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    select: { id: true, status: true, receiptNumber: true, paidAt: true },
  });
  if (!billing) {
    return { error: "Billing not found." };
  }
  if (!canReviewBillingPayment(billing.status)) {
    return { error: "Only payment-submitted billings can be approved." };
  }

  const payment = await prisma.billingPayment.findFirst({
    where: { id: paymentId, billingId: billing.id },
    select: { id: true, reviewStatus: true },
  });
  if (!payment) {
    return { error: "Payment submission not found." };
  }
  if (payment.reviewStatus !== "PENDING") {
    return { error: "Payment submission has already been reviewed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.billingPayment.update({
      where: { id: payment.id },
      data: {
        reviewStatus: "APPROVED",
        reviewedAt: new Date(),
        rejectReason: null,
      },
    });
    const receiptNumber =
      billing.receiptNumber ?? (await generateReceiptNumber(tx, new Date()));
    await tx.billing.update({
      where: { id: billing.id },
      data: {
        status: "PAID",
        paidAt: billing.paidAt ?? new Date(),
        receiptNumber,
        rejectReason: null,
        rejectedAt: null,
      },
    });
  });

  const billingWithServiceStore = await prisma.billing.findUnique({
    where: { id: billing.id },
    select: {
      id: true,
      status: true,
      receiptNumber: true,
      serviceStore: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  revalidateBillingPaths(billing.id);
  if (billingWithServiceStore) {
    const users = await prisma.user.findMany({
      where: {
        serviceStoreId: billingWithServiceStore.serviceStore.id,
        lineUserId: { not: null },
      },
      select: { lineUserId: true },
    });
    for (const user of users) {
      if (!user.lineUserId) {
        continue;
      }
      await sendPaymentApproved({
        recipientLineUserId: user.lineUserId,
        billingId: billingWithServiceStore.id,
        billingNumber:
          billingWithServiceStore.receiptNumber ?? billingWithServiceStore.id,
        serviceStoreName: billingWithServiceStore.serviceStore.name,
        status: billingWithServiceStore.status.replaceAll("_", " "),
      });
    }
  }
  return { success: "Payment approved. Billing marked as paid." };
}

export async function rejectBillingPaymentAsAdmin(
  billingId: string,
  paymentId: string,
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await assertAdminReviewer();
  } catch {
    return { error: "Unauthorized." };
  }

  const parsed = rejectBillingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    select: { id: true, status: true },
  });
  if (!billing) {
    return { error: "Billing not found." };
  }
  if (!canReviewBillingPayment(billing.status)) {
    return { error: "Only payment-submitted billings can be rejected." };
  }

  const payment = await prisma.billingPayment.findFirst({
    where: { id: paymentId, billingId: billing.id },
    select: { id: true, reviewStatus: true },
  });
  if (!payment) {
    return { error: "Payment submission not found." };
  }
  if (payment.reviewStatus !== "PENDING") {
    return { error: "Payment submission has already been reviewed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.billingPayment.update({
      where: { id: payment.id },
      data: {
        reviewStatus: "REJECTED",
        reviewedAt: new Date(),
        rejectReason: parsed.data.reason,
      },
    });
    await tx.billing.update({
      where: { id: billing.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectReason: parsed.data.reason,
      },
    });
  });

  revalidateBillingPaths(billing.id);
  return { success: "Payment rejected." };
}

export type AdminBillingDrawerPayload = {
  id: string;
  storeName: string;
  invoiceNumber: string | null;
  periodLabel: string;
  bookingCount: number;
  bookingFee: string;
  vat: string;
  vatRate: string;
  total: string;
  status: string;
  rejectReason: string | null;
  payment: {
    id: string;
    amount: string;
    paymentDate: string;
    submittedAt: string;
    fileName: string;
    mimeType: string;
    referenceNumber: string | null;
    reviewStatus: string;
    previewUrl: string;
  } | null;
};

export async function getAdminBillingDrawerPayload(
  billingId: string,
): Promise<AdminBillingDrawerPayload | null> {
  try {
    await assertAdminReviewer();
  } catch {
    return null;
  }

  const billing = await getAdminBillingDetail(billingId);
  if (!billing) return null;

  const latestPayment = billing.payments[0] ?? null;
  const previewUrl = latestPayment
    ? await getPaymentSlipPreviewUrl(latestPayment.slipKey)
    : "";

  return {
    id: billing.id,
    storeName: billing.serviceStore.name,
    invoiceNumber: billing.invoiceNumber,
    periodLabel: `${formatBillingDate(billing.periodStart)} – ${formatBillingDate(billing.periodEnd)}`,
    bookingCount: billing.bookingCount,
    bookingFee: billing.bookingFee.toString(),
    vat: billing.vat.toString(),
    vatRate: billing.vatRate.toString(),
    total: billing.total.toString(),
    status: billing.status,
    rejectReason: billing.rejectReason,
    payment: latestPayment
      ? {
          id: latestPayment.id,
          amount: latestPayment.amount.toString(),
          paymentDate: latestPayment.paymentDate.toISOString(),
          submittedAt: latestPayment.submittedAt.toISOString(),
          fileName: latestPayment.fileName,
          mimeType: latestPayment.mimeType,
          referenceNumber: latestPayment.referenceNumber,
          reviewStatus: latestPayment.reviewStatus,
          previewUrl,
        }
      : null,
  };
}

export async function estimateBillingGeneration(
  periodStart: string,
  periodEnd: string,
): Promise<BillingGenerationEstimate | null> {
  try {
    await assertAdminReviewer();
  } catch {
    return null;
  }

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return getBillingGenerationEstimate(start, end);
}
