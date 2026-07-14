import { Prisma } from "@/lib/generated/prisma/client";
import { generateInvoiceNumber } from "@/lib/billing/numbering";
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
    serviceStoreId: string;
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
      branch: { select: { serviceStoreId: true } },
    },
  });

  const groupedByServiceStore = new Map<
    string,
    Array<{ id: string; bookingNumber: string; bookingDate: Date }>
  >();

  for (const booking of completedBookings) {
    const list = groupedByServiceStore.get(booking.branch.serviceStoreId) ?? [];
    list.push({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate,
    });
    groupedByServiceStore.set(booking.branch.serviceStoreId, list);
  }

  let createdCount = 0;
  let skippedCount = 0;
  const createdBillings: Array<{ id: string; serviceStoreId: string }> = [];

  for (const [serviceStoreId, bookings] of groupedByServiceStore.entries()) {
    const existing = await prisma.billing.findUnique({
      where: {
        serviceStoreId_periodStart_periodEnd: {
          serviceStoreId,
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
    // Platform booking fee is VAT-inclusive.
    const total = feeDecimal.mul(bookingCount);
    const vat =
      vatRateDecimal.gt(0)
        ? total.mul(vatRateDecimal).div(vatRateDecimal.add(100))
        : new Prisma.Decimal(0);
    const subtotal = total.sub(vat);
    const discount = new Prisma.Decimal(0);

    const created = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateInvoiceNumber(tx, input.periodEnd);
      return tx.billing.create({
        data: {
          serviceStoreId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          bookingFee: feeDecimal,
          vatRate: vatRateDecimal,
          bookingCount,
          subtotal,
          vat,
          discount,
          total,
          status: "PENDING",
          invoiceNumber,
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
    });

    createdCount += 1;
    createdBillings.push({ id: created.id, serviceStoreId });
  }

  return { createdCount, skippedCount, createdBillings };
}
