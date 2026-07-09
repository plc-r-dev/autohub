"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { requireLinkedIdentity } from "@/lib/auth/require-identity";
import { generateInvoiceNumber, generateReceiptNumber } from "@/lib/billing/numbering";
import {
  billingGenerationSchema,
  rejectBillingSchema,
  uploadPaymentSlipSchema,
} from "@/lib/billing/schemas";
import { generateBillingsForPeriod } from "@/lib/billing/service";
import {
  sendBillingApproved,
  sendBillingGenerated,
  sendPaymentApproved,
} from "@/lib/line/line-notification-service";
import { prisma } from "@/lib/prisma";
import { uploadPaymentSlipFile } from "@/lib/storage/upload-service";
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
  revalidatePath("/merchant/billings");
  revalidatePath(`/merchant/billings/${billingId}`);
  revalidatePath("/merchant/dashboard");
  revalidatePath("/admin/billings");
  revalidatePath(`/admin/billings/${billingId}`);
}

async function assertAdminReviewer() {
  await requireLinkedIdentity();
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
  revalidatePath("/merchant/billings");

  if (result.createdBillings.length > 0) {
    const merchantIds = [...new Set(result.createdBillings.map((row) => row.merchantId))];
    const [users, billings] = await Promise.all([
      prisma.user.findMany({
        where: {
          merchantId: { in: merchantIds },
          lineUserId: { not: null },
        },
        select: {
          merchantId: true,
          lineUserId: true,
        },
      }),
      prisma.billing.findMany({
        where: { id: { in: result.createdBillings.map((row) => row.id) } },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          merchant: { select: { id: true, name: true } },
        },
      }),
    ]);

    const usersByMerchant = new Map<string, string[]>();
    for (const user of users) {
      if (!user.merchantId || !user.lineUserId) {
        continue;
      }
      const rows = usersByMerchant.get(user.merchantId) ?? [];
      rows.push(user.lineUserId);
      usersByMerchant.set(user.merchantId, rows);
    }

    for (const billing of billings) {
      const recipients = usersByMerchant.get(billing.merchant.id) ?? [];
      for (const recipientLineUserId of recipients) {
        await sendBillingGenerated({
          recipientLineUserId,
          billingId: billing.id,
          billingNumber: billing.invoiceNumber ?? billing.id,
          merchantName: billing.merchant.name,
          status: billing.status.replaceAll("_", " "),
        });
      }
    }
  }

  return {
    success: `Generated ${result.createdCount} billings, skipped ${result.skippedCount} existing.`,
  };
}

export async function submitBillingAsMerchant(
  billingId: string,
): Promise<BillingActionState> {
  const { merchant } = await requireApprovedMerchantUser();

  const billing = await prisma.billing.findFirst({
    where: { id: billingId, merchantId: merchant.id },
    select: { id: true, status: true },
  });

  if (!billing) {
    return { error: "Billing not found." };
  }

  if (billing.status !== "DRAFT") {
    return { error: "Only draft billings can be submitted." };
  }

  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      rejectReason: null,
    },
  });

  revalidateBillingPaths(billing.id);
  return { success: "Billing submitted for review." };
}

export async function uploadBillingPaymentSlip(
  billingId: string,
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const { merchant } = await requireApprovedMerchantUser();

  const billing = await prisma.billing.findFirst({
    where: { id: billingId, merchantId: merchant.id },
    select: { id: true, status: true },
  });

  if (!billing) {
    return { error: "Billing not found." };
  }

  if (!["APPROVED", "PAYMENT_REJECTED"].includes(billing.status)) {
    return {
      error: "Payment slip can only be uploaded for approved or payment-rejected billings.",
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

  const paymentId = randomUUID();

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

  await prisma.$transaction(async (tx) => {
    await tx.billingPayment.create({
      data: {
        id: paymentId,
        billingId: billing.id,
        paymentDate,
        amount: new Prisma.Decimal(parsed.data.amount),
        bank: parsed.data.bank,
        referenceNumber: parsed.data.referenceNumber,
        note: parsed.data.note,
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
        rejectReason: null,
      },
    });
  });

  revalidateBillingPaths(billing.id);
  return { success: "Payment slip submitted for review." };
}

export async function approveBillingAsAdmin(
  billingId: string,
): Promise<BillingActionState> {
  try {
    await assertAdminReviewer();
  } catch {
    return { error: "Unauthorized." };
  }

  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    select: { id: true, status: true, approvedAt: true, invoiceNumber: true },
  });

  if (!billing) {
    return { error: "Billing not found." };
  }

  if (billing.status !== "SUBMITTED") {
    return { error: "Only submitted billings can be approved." };
  }

  await prisma.$transaction(async (tx) => {
    const invoiceNumber =
      billing.invoiceNumber ?? (await generateInvoiceNumber(tx, new Date()));
    await tx.billing.update({
      where: { id: billing.id },
      data: {
        status: "APPROVED",
        approvedAt: billing.approvedAt ?? new Date(),
        rejectedAt: null,
        rejectReason: null,
        invoiceNumber,
      },
    });
  });

  const billingWithMerchant = await prisma.billing.findUnique({
    where: { id: billing.id },
    select: {
      id: true,
      status: true,
      invoiceNumber: true,
      merchant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  revalidateBillingPaths(billing.id);
  if (billingWithMerchant) {
    const users = await prisma.user.findMany({
      where: {
        merchantId: billingWithMerchant.merchant.id,
        lineUserId: { not: null },
      },
      select: { lineUserId: true },
    });
    for (const user of users) {
      if (!user.lineUserId) {
        continue;
      }
      await sendBillingApproved({
        recipientLineUserId: user.lineUserId,
        billingId: billingWithMerchant.id,
        billingNumber: billingWithMerchant.invoiceNumber ?? billingWithMerchant.id,
        merchantName: billingWithMerchant.merchant.name,
        status: billingWithMerchant.status.replaceAll("_", " "),
      });
    }
  }
  return { success: "Billing approved." };
}

export async function rejectBillingAsAdmin(
  billingId: string,
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
  if (billing.status !== "SUBMITTED") {
    return { error: "Only submitted billings can be rejected." };
  }

  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectReason: parsed.data.reason,
    },
  });

  revalidateBillingPaths(billing.id);
  return { success: "Billing rejected." };
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
  if (billing.status !== "PAYMENT_SUBMITTED") {
    return { error: "Only payment-submitted billings can be paid." };
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
      },
    });
  });

  const billingWithMerchant = await prisma.billing.findUnique({
    where: { id: billing.id },
    select: {
      id: true,
      status: true,
      receiptNumber: true,
      merchant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  revalidateBillingPaths(billing.id);
  if (billingWithMerchant) {
    const users = await prisma.user.findMany({
      where: {
        merchantId: billingWithMerchant.merchant.id,
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
        billingId: billingWithMerchant.id,
        billingNumber: billingWithMerchant.receiptNumber ?? billingWithMerchant.id,
        merchantName: billingWithMerchant.merchant.name,
        status: billingWithMerchant.status.replaceAll("_", " "),
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
  if (billing.status !== "PAYMENT_SUBMITTED") {
    return { error: "Only payment-submitted billings can be reviewed." };
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
        status: "PAYMENT_REJECTED",
        rejectReason: parsed.data.reason,
      },
    });
  });

  revalidateBillingPaths(billing.id);
  return { success: "Payment rejected." };
}
