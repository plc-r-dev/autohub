import { Prisma } from "@/lib/generated/prisma/client";
import { getBillingSettingsSnapshot } from "@/lib/platform-settings/queries";
import { prisma } from "@/lib/prisma";

export type BillingPeriodInput = {
  periodStart: Date;
  periodEnd: Date;
};

export type BillingGenerationResult = {
  createdCount: number;
  skippedCount: number;
  createdBillings: Array<{
    id: string;
    merchantId: string;
  }>;
};

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export async function generateBillingsForPeriod(
  input: BillingPeriodInput,
): Promise<BillingGenerationResult> {
  const snapshot = await getBillingSettingsSnapshot();
  const feeDecimal = toDecimal(snapshot.bookingFee);
  const vatRateDecimal = toDecimal(snapshot.vatRate);

  const completedBookings = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: input.periodStart,
        lte: input.periodEnd,
      },
    },
    select: {
      id: true,
      bookingNumber: true,
      bookingDate: true,
      branch: { select: { merchantId: true } },
    },
  });

  const groupedByMerchant = new Map<
    string,
    Array<{ id: string; bookingNumber: string; bookingDate: Date }>
  >();

  for (const booking of completedBookings) {
    const list = groupedByMerchant.get(booking.branch.merchantId) ?? [];
    list.push({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate,
    });
    groupedByMerchant.set(booking.branch.merchantId, list);
  }

  let createdCount = 0;
  let skippedCount = 0;
  const createdBillings: Array<{ id: string; merchantId: string }> = [];

  for (const [merchantId, bookings] of groupedByMerchant.entries()) {
    const existing = await prisma.billing.findUnique({
      where: {
        merchantId_periodStart_periodEnd: {
          merchantId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        },
      },
      select: { id: true },
    });

    if (existing) {
      skippedCount += 1;
      continue;
    }

    const bookingCount = bookings.length;
    const subtotal = feeDecimal.mul(bookingCount);
    const vat = subtotal.mul(vatRateDecimal).div(100);
    const discount = new Prisma.Decimal(0);
    const total = subtotal.add(vat).sub(discount);

    const created = await prisma.billing.create({
      data: {
        merchantId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bookingFee: feeDecimal,
        vatRate: vatRateDecimal,
        bookingCount,
        subtotal,
        vat,
        discount,
        total,
        status: "DRAFT",
        items: {
          create: bookings.map((booking) => ({
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            bookingDate: booking.bookingDate,
            fee: feeDecimal,
            amount: feeDecimal,
          })),
        },
      },
    });

    createdCount += 1;
    createdBillings.push({ id: created.id, merchantId });
  }

  return { createdCount, skippedCount, createdBillings };
}
