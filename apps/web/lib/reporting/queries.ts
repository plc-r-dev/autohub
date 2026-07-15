import { Prisma } from "@/lib/generated/prisma/client";
import {
  addDays,
  endOfDay,
  formatDashboardDateKey,
  isToday,
  startOfDay,
} from "@/lib/reporting/dashboard-date";
import { prisma } from "@/lib/prisma";

export type ReportFilters = {
  from?: Date;
  to?: Date;
  serviceStoreId?: string;
  branchId?: string;
  bookingStatus?: string;
};

export type DashboardCardMetrics = {
  totalServiceStores: number;
  activeServiceStores: number;
  suspendedServiceStores: number;
  totalCustomers: number;
  totalVehicles: number;
  totalBookings: number;
  todaysBookings: number;
  todaysRevenue: number;
  outstandingBilling: number;
  pendingServiceStoreApproval: number;
  pendingBillingApproval: number;
  pendingPaymentReview: number;
};

type CountRow = { bucket: string; count: bigint };
type AmountRow = { bucket: string; amount: Prisma.Decimal };

function startOfToday(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfToday(): Date {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfYesterday(): Date {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfYesterday(): Date {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  return end;
}

function fillLast7DaySeries(
  rows: Array<{ bucket: string; value: number }>,
  anchorDate: Date,
): Array<{ label: string; value: number }> {
  const map = new Map(rows.map((row) => [row.bucket, row.value]));
  const series: Array<{ label: string; value: number }> = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays(anchorDate, -offset);
    const bucket = formatDayBucket(date);
    series.push({
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      value: map.get(bucket) ?? 0,
    });
  }

  return series;
}

function formatDayBucket(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function buildBookingFilterSql(filters: ReportFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (filters.from) {
    conditions.push(Prisma.sql`b."bookingDate" >= ${filters.from}`);
  }
  if (filters.to) {
    conditions.push(Prisma.sql`b."bookingDate" <= ${filters.to}`);
  }
  if (filters.serviceStoreId) {
    conditions.push(Prisma.sql`br."serviceStoreId" = ${filters.serviceStoreId}`);
  }
  if (filters.branchId) {
    conditions.push(Prisma.sql`b."branchId" = ${filters.branchId}`);
  }
  if (filters.bookingStatus) {
    conditions.push(Prisma.sql`b."status"::text = ${filters.bookingStatus}`);
  }

  if (conditions.length === 0) {
    return Prisma.sql`TRUE`;
  }
  let whereSql = conditions[0]!;
  for (let index = 1; index < conditions.length; index += 1) {
    whereSql = Prisma.sql`${whereSql} AND ${conditions[index]!}`;
  }
  return whereSql;
}

export async function getPlatformDashboardCardMetrics(): Promise<DashboardCardMetrics> {
  const [
    totalServiceStores,
    activeServiceStores,
    suspendedServiceStores,
    totalCustomers,
    totalVehicles,
    totalBookings,
  ] = await Promise.all([
    prisma.serviceStore.count(),
    prisma.serviceStore.count({ where: { status: "ACTIVE" } }),
    prisma.serviceStore.count({ where: { status: "SUSPENDED" } }),
    prisma.customer.count(),
    prisma.vehicle.count(),
    prisma.booking.count(),
  ]);

  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [todaysBookings, todaysRevenueRaw, outstandingBillingRaw, pendingClaims, pendingRequests, pendingBillingApproval, pendingPaymentReview] =
    await Promise.all([
      prisma.booking.count({
        where: {
          bookingDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.bookingItem.aggregate({
        where: {
          booking: {
            status: "COMPLETED",
            completedAt: { gte: todayStart, lte: todayEnd },
          },
        },
        _sum: { unitPrice: true },
      }),
      prisma.billing.aggregate({
        where: { status: { not: "PAID" } },
        _sum: { total: true },
      }),
      prisma.serviceStoreClaim.count({ where: { status: "PENDING" } }),
      prisma.serviceStoreOnboardingRequest.count({ where: { status: "PENDING" } }),
      prisma.billing.count({ where: { status: "PENDING" } }),
      prisma.billingPayment.count({
        where: {
          reviewStatus: "PENDING",
          billing: { status: "PAYMENT_SUBMITTED" },
        },
      }),
    ]);

  return {
    totalServiceStores,
    activeServiceStores,
    suspendedServiceStores,
    totalCustomers,
    totalVehicles,
    totalBookings,
    todaysBookings,
    todaysRevenue: Number(todaysRevenueRaw._sum.unitPrice ?? 0),
    outstandingBilling: Number(outstandingBillingRaw._sum.total ?? 0),
    pendingServiceStoreApproval: pendingClaims + pendingRequests,
    pendingBillingApproval,
    pendingPaymentReview,
  };
}

export async function getBookingTrend(days: 7 | 30): Promise<Array<{ bucket: string; count: number }>> {
  const rows = await prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT to_char(date_trunc('day', b."bookingDate"), 'YYYY-MM-DD') AS bucket,
           COUNT(*)::bigint AS count
    FROM "Booking" b
    WHERE b."bookingDate" >= now() - (${days}::text || ' days')::interval
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) }));
}

export async function getMonthlyRevenueTrend(): Promise<Array<{ bucket: string; amount: number }>> {
  const rows = await prisma.$queryRaw<AmountRow[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', b."completedAt"), 'YYYY-MM') AS bucket,
           COALESCE(SUM(bi."unitPrice" * bi."quantity"), 0)::numeric AS amount
    FROM "Booking" b
    JOIN "BookingItem" bi ON bi."bookingId" = b."id"
    WHERE b."status" = 'COMPLETED' AND b."completedAt" IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({ bucket: row.bucket, amount: Number(row.amount) }));
}

export async function getBillingPaidVsOutstanding(): Promise<{ paid: number; outstanding: number }> {
  const [paidRaw, outstandingRaw] = await Promise.all([
    prisma.billing.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    prisma.billing.aggregate({ where: { status: { not: "PAID" } }, _sum: { total: true } }),
  ]);

  return {
    paid: Number(paidRaw._sum.total ?? 0),
    outstanding: Number(outstandingRaw._sum.total ?? 0),
  };
}

export async function getServiceStoreGrowthMonthly(): Promise<Array<{ bucket: string; count: number }>> {
  const rows = await prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', m."createdAt"), 'YYYY-MM') AS bucket,
           COUNT(*)::bigint AS count
    FROM "ServiceStore" m
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) }));
}

export type ServiceStoreDashboardMetricsOptions = {
  date?: Date;
};

export async function getServiceStoreDashboardMetrics(
  serviceStoreId: string,
  options: ServiceStoreDashboardMetricsOptions = {},
) {
  const anchorDate = startOfDay(options.date ?? new Date());
  const dayStart = startOfDay(anchorDate);
  const dayEnd = endOfDay(anchorDate);
  const previousDayStart = startOfDay(addDays(anchorDate, -1));
  const previousDayEnd = endOfDay(addDays(anchorDate, -1));
  const trendStart = startOfDay(addDays(anchorDate, -6));
  const topServicesStart = startOfDay(addDays(anchorDate, -29));

  const [
    todayStatusRows,
    todaysBookings,
    inService,
    todaysRevenueRaw,
    outstandingBillingRaw,
    recentBookings,
    upcomingBookings,
    topServicesRows,
    recentCustomersRows,
    yesterdayBookings,
    activeCustomersRaw,
    previousDayCustomersRaw,
    revenueTrendRows,
    bookingTrendRows,
    liveActivityRows,
  ] =
    await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        where: {
          branch: { serviceStoreId },
          bookingDate: { gte: dayStart, lte: dayEnd },
        },
        _count: { _all: true },
      }),
      prisma.booking.count({
        where: {
          branch: { serviceStoreId },
          bookingDate: { gte: dayStart, lte: dayEnd },
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
        },
      }),
      prisma.booking.count({
        where: {
          branch: { serviceStoreId },
          status: "IN_PROGRESS",
          ...(isToday(anchorDate)
            ? {}
            : { bookingDate: { gte: dayStart, lte: dayEnd } }),
        },
      }),
      prisma.bookingItem.aggregate({
        where: {
          booking: {
            branch: { serviceStoreId },
            status: "COMPLETED",
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        },
        _sum: { unitPrice: true },
      }),
      prisma.billing.aggregate({
        where: { serviceStoreId, status: { not: "PAID" } },
        _sum: { total: true },
      }),
      prisma.booking.findMany({
        where: {
          branch: { serviceStoreId },
        },
        select: {
          bookingNumber: true,
          bookingDate: true,
          status: true,
          customer: {
            select: { id: true, firstName: true, lastName: true, linePictureUrl: true },
          },
          branch: { select: { name: true } },
          vehicle: { select: { brand: true, model: true, licensePlate: true } },
          items: {
            take: 1,
            select: { service: { select: { name: true } } },
          },
        },
        orderBy: { bookingDate: "desc" },
        take: 50,
      }),
      prisma.booking.findMany({
        where: {
          branch: { serviceStoreId },
          bookingDate: { gte: startOfDay(new Date()) },
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
        select: {
          bookingNumber: true,
          bookingDate: true,
          status: true,
          customer: {
            select: { firstName: true, lastName: true, linePictureUrl: true },
          },
          branch: { select: { name: true } },
        },
        orderBy: { bookingDate: "asc" },
        take: 15,
      }),
      prisma.$queryRaw<Array<{ serviceName: string; qty: bigint }>>(Prisma.sql`
        SELECT s."name" AS "serviceName",
               SUM(bi."quantity")::bigint AS qty
        FROM "BookingItem" bi
        JOIN "Booking" b ON b."id" = bi."bookingId"
        JOIN "Service" s ON s."id" = bi."serviceId"
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
          AND b."status" = 'COMPLETED'
          AND b."bookingDate" >= ${topServicesStart}
          AND b."bookingDate" <= ${dayEnd}
        GROUP BY s."name"
        ORDER BY qty DESC
        LIMIT 5
      `),
      prisma.$queryRaw<
        Array<{
          customerId: string
          firstName: string
          lastName: string
          linePictureUrl: string | null
          lastBookingDate: Date
        }>
      >(Prisma.sql`
        SELECT c."id" AS "customerId",
               c."firstName",
               c."lastName",
               c."linePictureUrl",
               MAX(b."bookingDate") AS "lastBookingDate"
        FROM "Booking" b
        JOIN "Customer" c ON c."id" = b."customerId"
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
        GROUP BY c."id", c."firstName", c."lastName", c."linePictureUrl"
        ORDER BY "lastBookingDate" DESC
        LIMIT 8
      `),
      prisma.booking.count({
        where: {
          branch: { serviceStoreId },
          bookingDate: { gte: previousDayStart, lte: previousDayEnd },
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
        },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT b."customerId")::bigint AS count
        FROM "Booking" b
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
          AND b."bookingDate" >= ${dayStart}
          AND b."bookingDate" <= ${dayEnd}
      `),
      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT b."customerId")::bigint AS count
        FROM "Booking" b
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
          AND b."bookingDate" >= ${previousDayStart}
          AND b."bookingDate" <= ${previousDayEnd}
      `),
      prisma.$queryRaw<Array<{ bucket: string; amount: Prisma.Decimal }>>(Prisma.sql`
        SELECT to_char(date_trunc('day', b."completedAt"), 'YYYY-MM-DD') AS bucket,
               COALESCE(SUM(bi."unitPrice" * bi."quantity"), 0)::numeric AS amount
        FROM "Booking" b
        JOIN "BookingItem" bi ON bi."bookingId" = b."id"
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
          AND b."status" = 'COMPLETED'
          AND b."completedAt" >= ${trendStart}
          AND b."completedAt" <= ${dayEnd}
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT to_char(date_trunc('day', b."bookingDate"), 'YYYY-MM-DD') AS bucket,
               COUNT(*)::bigint AS count
        FROM "Booking" b
        JOIN "Branch" br ON br."id" = b."branchId"
        WHERE br."serviceStoreId" = ${serviceStoreId}
          AND b."bookingDate" >= ${trendStart}
          AND b."bookingDate" <= ${dayEnd}
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.booking.findMany({
        where: {
          branch: { serviceStoreId },
          OR: [
            { bookingDate: { gte: dayStart, lte: dayEnd } },
            { completedAt: { gte: dayStart, lte: dayEnd } },
          ],
        },
        select: {
          bookingNumber: true,
          status: true,
          bookingDate: true,
          completedAt: true,
          items: {
            take: 1,
            select: { service: { select: { name: true } } },
          },
        },
        orderBy: [{ completedAt: "desc" }, { bookingDate: "desc" }],
        take: 6,
      }),
    ]);

  const statusCount = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    NO_SHOW: 0,
    CANCELLED: 0,
    CONFIRMED: 0,
    CHECKED_IN: 0,
  };

  for (const row of todayStatusRows) {
    statusCount[row.status] = row._count._all;
  }

  const todaysBookingsCount = todaysBookings;
  const activeCustomers = Number(activeCustomersRaw[0]?.count ?? 0);
  const revenueTrend7 = fillLast7DaySeries(
    revenueTrendRows.map((row) => ({
      bucket: row.bucket,
      value: Number(row.amount),
    })),
    anchorDate,
  );
  const bookingTrend7 = fillLast7DaySeries(
    bookingTrendRows.map((row) => ({
      bucket: row.bucket,
      value: Number(row.count),
    })),
    anchorDate,
  ).map((point) => point.value);

  const liveActivity = liveActivityRows
    .map((booking) => {
      const serviceName = booking.items[0]?.service.name ?? "Service";
      if (booking.status === "COMPLETED" && booking.completedAt) {
        return {
          id: `${booking.bookingNumber}-completed`,
          type: "completed" as const,
          message: `Service completed · ${serviceName}`,
          timestamp: booking.completedAt,
        };
      }

      return {
        id: `${booking.bookingNumber}-booking`,
        type: "booking" as const,
        message: `New booking for ${serviceName}`,
        timestamp: booking.bookingDate,
      };
    })
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime());

  return {
    todaysBookings: todaysBookingsCount,
    todaysRevenue: Number(todaysRevenueRaw._sum.unitPrice ?? 0),
    inService,
    statusCount,
    recentBookings,
    upcomingBookings,
    topServices: topServicesRows.map((row) => ({
      serviceName: row.serviceName,
      qty: Number(row.qty),
    })),
    recentCustomers: recentCustomersRows,
    outstandingBilling: Number(outstandingBillingRaw._sum.total ?? 0),
    activeCustomers,
    bookingsTrendPct: trendPercent(todaysBookingsCount, yesterdayBookings),
    customersTrendPct: trendPercent(
      activeCustomers,
      Number(previousDayCustomersRaw[0]?.count ?? 0),
    ),
    revenueTrend7,
    bookingTrend7,
    liveActivity,
    selectedDate: formatDashboardDateKey(anchorDate),
  };
}

export async function getCustomerDashboardMetrics(customerId: string) {
  const [vehicles, upcomingBookings, bookingHistory, recentServices] = await Promise.all([
    prisma.vehicle.findMany({
      where: { customerId },
      select: {
        id: true,
        licensePlate: true,
        province: true,
        brand: true,
        model: true,
        year: true,
        color: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        customerId,
        bookingDate: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        bookingNumber: true,
        bookingDate: true,
        status: true,
        branch: { select: { name: true, serviceStore: { select: { name: true } } } },
        vehicle: { select: { licensePlate: true } },
      },
      orderBy: { bookingDate: "asc" },
      take: 10,
    }),
    prisma.booking.findMany({
      where: { customerId },
      select: {
        bookingNumber: true,
        bookingDate: true,
        status: true,
        branch: { select: { name: true, serviceStore: { select: { name: true } } } },
        vehicle: { select: { licensePlate: true } },
      },
      orderBy: { bookingDate: "desc" },
      take: 20,
    }),
    prisma.$queryRaw<Array<{ serviceName: string; lastDate: Date }>>(Prisma.sql`
      SELECT s."name" AS "serviceName",
             MAX(b."bookingDate") AS "lastDate"
      FROM "BookingItem" bi
      JOIN "Booking" b ON b."id" = bi."bookingId"
      JOIN "Service" s ON s."id" = bi."serviceId"
      WHERE b."customerId" = ${customerId}
      GROUP BY s."name"
      ORDER BY "lastDate" DESC
      LIMIT 8
    `),
  ]);

  return {
    vehicles,
    upcomingBookings,
    bookingHistory,
    recentServices,
    outstandingBills: 0,
  };
}

export async function getReportData(filters: ReportFilters) {
  const bookingFilterSql = buildBookingFilterSql(filters);

  const [bookingRows, billingRows, settlementRows, customerRows, vehicleRows] = await Promise.all([
    prisma.$queryRaw<Array<{
      bookingNumber: string;
      bookingDate: Date;
      status: string;
      serviceStoreName: string;
      branchName: string;
      customerName: string;
      licensePlate: string;
      totalAmount: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT b."bookingNumber",
             b."bookingDate",
             b."status"::text AS status,
             m."name" AS "serviceStoreName",
             br."name" AS "branchName",
             c."firstName" || ' ' || c."lastName" AS "customerName",
             v."licensePlate" AS "licensePlate",
             COALESCE(SUM(bi."unitPrice" * bi."quantity"), 0)::numeric AS "totalAmount"
      FROM "Booking" b
      JOIN "Branch" br ON br."id" = b."branchId"
      JOIN "ServiceStore" m ON m."id" = br."serviceStoreId"
      JOIN "Customer" c ON c."id" = b."customerId"
      JOIN "Vehicle" v ON v."id" = b."vehicleId"
      LEFT JOIN "BookingItem" bi ON bi."bookingId" = b."id"
      WHERE ${bookingFilterSql}
      GROUP BY b."bookingNumber", b."bookingDate", b."status", m."name", br."name", c."firstName", c."lastName", v."licensePlate"
      ORDER BY b."bookingDate" DESC
      LIMIT 1000
    `),
    prisma.$queryRaw<Array<{
      billingId: string;
      serviceStoreName: string;
      periodStart: Date;
      periodEnd: Date;
      status: string;
      total: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT bl."id" AS "billingId",
             m."name" AS "serviceStoreName",
             bl."periodStart",
             bl."periodEnd",
             bl."status"::text AS status,
             bl."total"
      FROM "Billing" bl
      JOIN "ServiceStore" m ON m."id" = bl."serviceStoreId"
      WHERE
        (${filters.serviceStoreId ?? null}::text IS NULL OR bl."serviceStoreId" = ${filters.serviceStoreId ?? null})
        AND (${filters.from ?? null}::timestamp IS NULL OR bl."periodStart" >= ${filters.from ?? null})
        AND (${filters.to ?? null}::timestamp IS NULL OR bl."periodEnd" <= ${filters.to ?? null})
      ORDER BY bl."periodStart" DESC
      LIMIT 1000
    `),
    prisma.$queryRaw<Array<{
      billingId: string;
      serviceStoreName: string;
      paymentDate: Date;
      amount: Prisma.Decimal;
      reviewStatus: string;
    }>>(Prisma.sql`
      SELECT bl."id" AS "billingId",
             m."name" AS "serviceStoreName",
             bp."paymentDate",
             bp."amount",
             bp."reviewStatus"::text AS "reviewStatus"
      FROM "BillingPayment" bp
      JOIN "Billing" bl ON bl."id" = bp."billingId"
      JOIN "ServiceStore" m ON m."id" = bl."serviceStoreId"
      WHERE
        (${filters.serviceStoreId ?? null}::text IS NULL OR bl."serviceStoreId" = ${filters.serviceStoreId ?? null})
        AND (${filters.from ?? null}::timestamp IS NULL OR bp."paymentDate" >= ${filters.from ?? null})
        AND (${filters.to ?? null}::timestamp IS NULL OR bp."paymentDate" <= ${filters.to ?? null})
      ORDER BY bp."paymentDate" DESC
      LIMIT 1000
    `),
    prisma.$queryRaw<Array<{
      customerId: string;
      customerName: string;
      phone: string | null;
      totalBookings: bigint;
      totalSpending: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT c."id" AS "customerId",
             c."firstName" || ' ' || c."lastName" AS "customerName",
             c."phone",
             COUNT(DISTINCT b."id")::bigint AS "totalBookings",
             COALESCE(SUM(bi."unitPrice" * bi."quantity"), 0)::numeric AS "totalSpending"
      FROM "Customer" c
      JOIN "Booking" b ON b."customerId" = c."id"
      JOIN "Branch" br ON br."id" = b."branchId"
      LEFT JOIN "BookingItem" bi ON bi."bookingId" = b."id"
      WHERE ${bookingFilterSql}
      GROUP BY c."id", c."firstName", c."lastName", c."phone"
      ORDER BY "totalBookings" DESC
      LIMIT 1000
    `),
    prisma.$queryRaw<Array<{
      vehicleId: string;
      licensePlate: string;
      brand: string;
      model: string;
      totalBookings: bigint;
      totalSpending: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT v."id" AS "vehicleId",
             v."licensePlate",
             v."brand",
             v."model",
             COUNT(DISTINCT b."id")::bigint AS "totalBookings",
             COALESCE(SUM(bi."unitPrice" * bi."quantity"), 0)::numeric AS "totalSpending"
      FROM "Vehicle" v
      JOIN "Booking" b ON b."vehicleId" = v."id"
      JOIN "Branch" br ON br."id" = b."branchId"
      LEFT JOIN "BookingItem" bi ON bi."bookingId" = b."id"
      WHERE ${bookingFilterSql}
      GROUP BY v."id", v."licensePlate", v."brand", v."model"
      ORDER BY "totalBookings" DESC
      LIMIT 1000
    `),
  ]);

  return {
    booking: bookingRows.map((row) => ({
      ...row,
      totalAmount: Number(row.totalAmount),
    })),
    billing: billingRows.map((row) => ({ ...row, total: Number(row.total) })),
    settlement: settlementRows.map((row) => ({ ...row, amount: Number(row.amount) })),
    customer: customerRows.map((row) => ({
      ...row,
      totalBookings: Number(row.totalBookings),
      totalSpending: Number(row.totalSpending),
    })),
    vehicle: vehicleRows.map((row) => ({
      ...row,
      totalBookings: Number(row.totalBookings),
      totalSpending: Number(row.totalSpending),
    })),
  };
}
