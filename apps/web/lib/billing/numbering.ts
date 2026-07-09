import type { Prisma } from "@/lib/generated/prisma/client";

function getMonthKey(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

function formatInvoiceNumber(monthKey: string, sequence: number): string {
  return `INV-${monthKey}-${String(sequence).padStart(6, "0")}`;
}

function formatReceiptNumber(monthKey: string, sequence: number): string {
  return `RCT-${monthKey}-${String(sequence).padStart(6, "0")}`;
}

export async function generateInvoiceNumber(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
  const monthKey = getMonthKey(date);
  const counter = await tx.invoiceNumberCounter.upsert({
    where: { monthKey },
    create: { monthKey, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return formatInvoiceNumber(monthKey, counter.lastNumber);
}

export async function generateReceiptNumber(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
  const monthKey = getMonthKey(date);
  const counter = await tx.receiptNumberCounter.upsert({
    where: { monthKey },
    create: { monthKey, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return formatReceiptNumber(monthKey, counter.lastNumber);
}
