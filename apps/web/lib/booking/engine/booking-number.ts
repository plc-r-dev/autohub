import type { Prisma } from "@/lib/generated/prisma/client";

export function formatBookingDateKey(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function formatBookingNumber(dateKey: string, sequence: number): string {
  return `AH-${dateKey}-${String(sequence).padStart(6, "0")}`;
}

export async function generateBookingNumber(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
  const dateKey = formatBookingDateKey(date);

  const counter = await tx.bookingNumberCounter.upsert({
    where: { dateKey },
    create: { dateKey, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  return formatBookingNumber(dateKey, counter.lastNumber);
}
