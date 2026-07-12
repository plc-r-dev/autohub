import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";

type ServiceStoreSeed = {
  province: "Bangkok" | "Nonthaburi" | "Pathum Thani";
  code: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string;
  latitude: number;
  longitude: number;
};

const MERCHANTS: ServiceStoreSeed[] = [
  {
    province: "Bangkok",
    code: "BKK-01",
    name: "Wash United",
    phone: "+66 2 720 1937",
    website: "https://www.facebook.com/washunitedthailand",
    address: "Ekkamai-Ram Inthra Rd, Lat Phrao, Bangkok 10230",
    latitude: 13.8102,
    longitude: 100.6132,
  },
  {
    province: "Bangkok",
    code: "BKK-02",
    name: "3M Car Care Rama 9",
    phone: "+66 2 716 6606",
    website: "https://www.facebook.com/3MCarCareThailand",
    address: "Rama IX Rd, Huai Khwang, Bangkok 10310",
    latitude: 13.7564,
    longitude: 100.5724,
  },
  {
    province: "Bangkok",
    code: "BKK-03",
    name: "Wizard Auto Care Srinakarin",
    phone: "+66 2 722 2229",
    website: "https://www.wizardcarcare.com",
    address: "Srinakarin Rd, Prawet, Bangkok 10250",
    latitude: 13.7026,
    longitude: 100.6502,
  },
  {
    province: "Bangkok",
    code: "BKK-04",
    name: "Carcare by B-Quik Ladprao",
    phone: "+66 2 938 8899",
    website: "https://www.facebook.com/BQuikThailand",
    address: "Ladprao Rd, Chatuchak, Bangkok 10900",
    latitude: 13.816,
    longitude: 100.5663,
  },
  {
    province: "Bangkok",
    code: "BKK-05",
    name: "PTT Fit Auto Car Wash Vibhavadi",
    phone: "+66 2 537 2200",
    website: "https://www.pttfitauto.com",
    address: "Vibhavadi Rangsit Rd, Chatuchak, Bangkok 10900",
    latitude: 13.8368,
    longitude: 100.5627,
  },
  {
    province: "Nonthaburi",
    code: "NBT-01",
    name: "Wash United Ratchaphruek",
    phone: "+66 2 102 4455",
    website: "https://www.facebook.com/washunitedthailand",
    address: "Ratchaphruek Rd, Bang Rak Noi, Mueang Nonthaburi 11000",
    latitude: 13.8586,
    longitude: 100.4708,
  },
  {
    province: "Nonthaburi",
    code: "NBT-02",
    name: "3M Car Care Nonthaburi",
    phone: "+66 2 969 5500",
    website: "https://www.facebook.com/3MCarCareThailand",
    address: "Tiwanon Rd, Talat Khwan, Mueang Nonthaburi 11000",
    latitude: 13.8599,
    longitude: 100.5144,
  },
  {
    province: "Nonthaburi",
    code: "NBT-03",
    name: "PTT Fit Auto Car Wash Chaeng Watthana",
    phone: "+66 2 584 0099",
    website: "https://www.pttfitauto.com",
    address: "Chaeng Watthana Rd, Pak Kret, Nonthaburi 11120",
    latitude: 13.9043,
    longitude: 100.5275,
  },
  {
    province: "Nonthaburi",
    code: "NBT-04",
    name: "B-Quik Car Wash Rattanathibet",
    phone: "+66 2 921 4455",
    website: "https://www.facebook.com/BQuikThailand",
    address: "Rattanathibet Rd, Bang Kraso, Mueang Nonthaburi 11000",
    latitude: 13.8663,
    longitude: 100.4884,
  },
  {
    province: "Nonthaburi",
    code: "NBT-05",
    name: "Carcare Nonthaburi (Ngamwongwan)",
    phone: null,
    website: "https://www.facebook.com/search/top?q=carwash%20ngamwongwan",
    address: "Ngamwongwan Rd, Bang Khen, Mueang Nonthaburi 11000",
    latitude: 13.8557,
    longitude: 100.5463,
  },
  {
    province: "Pathum Thani",
    code: "PTT-01",
    name: "PTT Fit Auto Car Wash Rangsit",
    phone: "+66 2 958 1122",
    website: "https://www.pttfitauto.com",
    address: "Phahonyothin Rd, Prachathipat, Thanyaburi, Pathum Thani 12130",
    latitude: 13.9897,
    longitude: 100.6185,
  },
  {
    province: "Pathum Thani",
    code: "PTT-02",
    name: "Wash United Future Park Rangsit",
    phone: "+66 2 958 0011",
    website: "https://www.facebook.com/washunitedthailand",
    address: "Rangsit-Nakhon Nayok Rd, Prachathipat, Thanyaburi 12130",
    latitude: 13.9893,
    longitude: 100.6189,
  },
  {
    province: "Pathum Thani",
    code: "PTT-03",
    name: "3M Car Care Khlong Luang",
    phone: "+66 2 516 8890",
    website: "https://www.facebook.com/3MCarCareThailand",
    address: "Phahonyothin Rd, Khlong Nueng, Khlong Luang 12120",
    latitude: 14.0728,
    longitude: 100.6077,
  },
  {
    province: "Pathum Thani",
    code: "PTT-04",
    name: "B-Quik Car Wash Lam Luk Ka",
    phone: "+66 2 995 7700",
    website: "https://www.facebook.com/BQuikThailand",
    address: "Lam Luk Ka Rd, Bueng Kham Phroi, Lam Luk Ka 12150",
    latitude: 13.9574,
    longitude: 100.7474,
  },
  {
    province: "Pathum Thani",
    code: "PTT-05",
    name: "Carcare Pathum Thani (Sema Fahkhram)",
    phone: null,
    website: "https://www.facebook.com/search/top?q=carwash%20pathum%20thani",
    address: "Sema Fahkhram Rd, Khu Khot, Lam Luk Ka 12130",
    latitude: 13.9501,
    longitude: 100.6418,
  },
];

const DEFAULT_SERVICES = [
  { code: "BASIC_WASH", name: "Basic Wash", duration: 30, price: 200, bufferMinutes: 5 },
  { code: "VACUUM", name: "Vacuum", duration: 20, price: 100, bufferMinutes: 0 },
  {
    code: "WASH_VACUUM",
    name: "Wash + Vacuum",
    duration: 45,
    price: 280,
    bufferMinutes: 5,
  },
  { code: "PREMIUM_WASH", name: "Premium Wash", duration: 60, price: 500, bufferMinutes: 10 },
  { code: "WAX", name: "Wax", duration: 45, price: 700, bufferMinutes: 10 },
] as const;

const DEFAULT_HOURS = [
  { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
] as const;

function createClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function seedTenant(prisma: PrismaClient) {
  return prisma.tenant.upsert({
    where: { code: "AUTOHUB" },
    update: { name: "AutoHub", status: "ACTIVE" },
    create: { code: "AUTOHUB", name: "AutoHub", status: "ACTIVE" },
    select: { id: true },
  });
}

async function seedTenantRole(prisma: PrismaClient, tenantId: string) {
  await prisma.role.upsert({
    where: { tenantId_code: { tenantId, code: "MERCHANT_OWNER" } },
    update: { name: "Service Store Owner" },
    create: { tenantId, code: "SERVICE_STORE_OWNER", name: "Service Store Owner" },
  });
}

async function upsertServices(prisma: PrismaClient, branchId: string) {
  for (const service of DEFAULT_SERVICES) {
    await prisma.service.upsert({
      where: { branchId_code: { branchId, code: service.code } },
      update: {
        name: service.name,
        duration: service.duration,
        price: new Prisma.Decimal(service.price),
        bufferMinutes: service.bufferMinutes,
        isActive: true,
      },
      create: {
        branchId,
        code: service.code,
        name: service.name,
        duration: service.duration,
        price: new Prisma.Decimal(service.price),
        bufferMinutes: service.bufferMinutes,
        isActive: true,
      },
    });
  }
}

async function replaceOperatingHours(prisma: PrismaClient, branchId: string) {
  await prisma.branchOperatingHours.deleteMany({ where: { branchId } });
  await prisma.branchOperatingHours.createMany({
    data: DEFAULT_HOURS.map((hour) => ({
      branchId,
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
    })),
  });
}

async function seedServiceStore(prisma: PrismaClient, tenantId: string, serviceStore: ServiceStoreSeed) {
  const savedServiceStore = await prisma.serviceStore.upsert({
    where: {
      tenantId_code: {
        tenantId,
        code: serviceStore.code,
      },
    },
    update: {
      name: serviceStore.name,
      description: "Development seed with publicly known car wash businesses.",
      phone: serviceStore.phone,
      website: serviceStore.website,
      status: "ACTIVE",
      bookingEnabled: true,
    },
    create: {
      tenantId,
      code: serviceStore.code,
      name: serviceStore.name,
      description: "Development seed with publicly known car wash businesses.",
      phone: serviceStore.phone,
      website: serviceStore.website,
      status: "ACTIVE",
      bookingEnabled: true,
    },
    select: { id: true },
  });

  const branch = await prisma.branch.upsert({
    where: {
      serviceStoreId_code: {
        serviceStoreId: savedServiceStore.id,
        code: "MAIN",
      },
    },
    update: {
      name: `${serviceStore.name} - Main Branch`,
      phone: serviceStore.phone,
      address: serviceStore.address,
      latitude: new Prisma.Decimal(serviceStore.latitude.toString()),
      longitude: new Prisma.Decimal(serviceStore.longitude.toString()),
      slotIntervalMinutes: 15,
      concurrentCapacity: 2,
    },
    create: {
      serviceStoreId: savedServiceStore.id,
      code: "MAIN",
      name: `${serviceStore.name} - Main Branch`,
      phone: serviceStore.phone,
      address: serviceStore.address,
      latitude: new Prisma.Decimal(serviceStore.latitude.toString()),
      longitude: new Prisma.Decimal(serviceStore.longitude.toString()),
      slotIntervalMinutes: 15,
      concurrentCapacity: 2,
    },
    select: { id: true },
  });

  await replaceOperatingHours(prisma, branch.id);
  await upsertServices(prisma, branch.id);
}

function seededDate(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function makeBookingDate(offsetHours: number, daysAgo: number): Date {
  const date = seededDate(daysAgo);
  date.setHours(9 + (offsetHours % 9), (offsetHours * 10) % 60, 0, 0);
  return date;
}

function requireAt<T>(items: readonly T[], index: number, label: string): T {
  if (items.length === 0) {
    throw new Error(`Seed data missing: ${label} is empty`);
  }
  const item = items[((index % items.length) + items.length) % items.length];
  if (item === undefined) {
    throw new Error(`Seed data missing: ${label}[${index}]`);
  }
  return item;
}

async function seedCustomersAndVehicles(prisma: PrismaClient, tenantId: string) {
  const customers: Array<{ id: string; userId: string; lineUserId: string }> = [];

  for (let i = 1; i <= 50; i += 1) {
    const n = String(i).padStart(3, "0");
    const user = await prisma.user.upsert({
      where: { authUserId: `seed-customer-auth-${n}` },
      update: {
        firstName: `Customer${n}`,
        lastName: "Seed",
        phone: `+6681000${String(i).padStart(4, "0")}`,
        email: `seed.customer.${n}@example.com`,
        status: "ACTIVE",
        tenantId,
      },
      create: {
        authUserId: `seed-customer-auth-${n}`,
        lineUserId: `seed-customer-line-${n}`,
        firstName: `Customer${n}`,
        lastName: "Seed",
        phone: `+6681000${String(i).padStart(4, "0")}`,
        email: `seed.customer.${n}@example.com`,
        status: "ACTIVE",
        tenantId,
      },
      select: { id: true },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {
        firstName: `Customer${n}`,
        lastName: "Seed",
        phone: `+6681000${String(i).padStart(4, "0")}`,
        email: `seed.customer.${n}@example.com`,
        lineUserId: `seed-customer-line-${n}`,
        status: "ACTIVE",
        tenantId,
      },
      create: {
        userId: user.id,
        tenantId,
        lineUserId: `seed-customer-line-${n}`,
        firstName: `Customer${n}`,
        lastName: "Seed",
        phone: `+6681000${String(i).padStart(4, "0")}`,
        email: `seed.customer.${n}@example.com`,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    customers.push({
      id: customer.id,
      userId: user.id,
      lineUserId: `seed-customer-line-${n}`,
    });
  }

  let vehicleCounter = 1;
  for (let i = 0; i < customers.length; i += 1) {
    const customer = requireAt(customers, i, "customers");
    const vehicleCount = i < 30 ? 2 : 1;
    for (let v = 0; v < vehicleCount; v += 1) {
      const plateNo = String(vehicleCounter).padStart(4, "0");
      await prisma.vehicle.upsert({
        where: {
          customerId_licensePlate: {
            customerId: customer.id,
            licensePlate: `SEED-${plateNo}`,
          },
        },
        update: {
          province: "Bangkok",
          brand: v % 2 === 0 ? "Toyota" : "Honda",
          model: v % 2 === 0 ? "Yaris" : "City",
          year: 2018 + (vehicleCounter % 6),
          color: v % 2 === 0 ? "White" : "Black",
        },
        create: {
          customerId: customer.id,
          province: "Bangkok",
          brand: v % 2 === 0 ? "Toyota" : "Honda",
          model: v % 2 === 0 ? "Yaris" : "City",
          year: 2018 + (vehicleCounter % 6),
          licensePlate: `SEED-${plateNo}`,
          color: v % 2 === 0 ? "White" : "Black",
        },
      });
      vehicleCounter += 1;
    }
  }

  return customers;
}

async function seedServiceStoreClaims(prisma: PrismaClient, tenantId: string, serviceStoreIds: string[]) {
  for (let i = 0; i < serviceStoreIds.length; i += 1) {
    const serviceStoreId = requireAt(serviceStoreIds, i, "serviceStoreIds");
    const n = String(i + 1).padStart(3, "0");

    // First 10 serviceStores are bookable partners; next 2 joining; rest discovered-only.
    const claimStatus =
      i < 10 ? "APPROVED" : i < 12 ? "PENDING" : null;
    const bookingEnabled = i < 10;

    await prisma.serviceStore.update({
      where: { id: serviceStoreId },
      data: {
        bookingEnabled,
        ...(claimStatus === "APPROVED"
          ? {
              payoutBankName: "Kasikornbank",
              payoutAccountName: `Seed Partner ${n}`,
              payoutAccountNumber: `123-4-${n}0000-1`,
              payoutBankBranch: "Head Office",
            }
          : {}),
      },
    });

    if (!claimStatus) {
      continue;
    }

    const user = await prisma.user.upsert({
      where: { authUserId: `seed-service-store-claim-auth-${n}` },
      update: {
        firstName: `Claimant${n}`,
        lastName: "Seed",
        phone: `+6691000${String(i + 1).padStart(4, "0")}`,
        email: `seed.claimant.${n}@example.com`,
        tenantId,
        ...(claimStatus === "APPROVED" ? { serviceStoreId } : {}),
      },
      create: {
        authUserId: `seed-service-store-claim-auth-${n}`,
        lineUserId: `seed-service-store-claim-line-${n}`,
        firstName: `Claimant${n}`,
        lastName: "Seed",
        phone: `+6691000${String(i + 1).padStart(4, "0")}`,
        email: `seed.claimant.${n}@example.com`,
        tenantId,
        ...(claimStatus === "APPROVED" ? { serviceStoreId } : {}),
      },
      select: { id: true },
    });

    if (claimStatus === "APPROVED") {
      await prisma.serviceStoreMember.upsert({
        where: {
          serviceStoreId_userId: {
            serviceStoreId,
            userId: user.id,
          },
        },
        update: { role: "OWNER" },
        create: {
          serviceStoreId,
          userId: user.id,
          role: "OWNER",
        },
      });
    }

    const existing = await prisma.serviceStoreClaim.findFirst({
      where: {
        serviceStoreId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!existing) {
      await prisma.serviceStoreClaim.create({
        data: {
          serviceStoreId,
          userId: user.id,
          status: claimStatus,
          reviewedAt: claimStatus === "APPROVED" ? new Date() : null,
        },
      });
    } else {
      await prisma.serviceStoreClaim.update({
        where: { id: existing.id },
        data: {
          status: claimStatus,
          reviewedAt: claimStatus === "APPROVED" ? new Date() : null,
        },
      });
    }
  }
}

async function seedBookingsAndBilling(prisma: PrismaClient, tenantId: string) {
  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      serviceStoreId: true,
      services: {
        where: { isActive: true },
        orderBy: { code: "asc" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const customers = await prisma.customer.findMany({
    where: { tenantId },
    select: {
      id: true,
      vehicles: { select: { id: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  if (branches.length === 0 || customers.length === 0) {
    return;
  }

  const statuses: Array<
    "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  > = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];

  for (let i = 1; i <= 200; i += 1) {
    const branch = requireAt(branches, i - 1, "branches");
    const customer = requireAt(customers, i - 1, "customers");
    const vehicle = requireAt(customer.vehicles, i - 1, `customer[${customer.id}].vehicles`);
    const service = requireAt(branch.services, i - 1, `branch[${branch.id}].services`);
    const status = requireAt(statuses, i - 1, "statuses");
    const bookingDate = makeBookingDate(i % 11, i % 40);
    const bookingNumber = `SEED-${String(i).padStart(6, "0")}`;
    const unitPrice = new Prisma.Decimal(100 + ((i % 5) + 1) * 80);
    const isConfirmed = status === "CONFIRMED" || status === "IN_PROGRESS" || status === "COMPLETED";
    const isStarted = status === "IN_PROGRESS" || status === "COMPLETED";

    await prisma.booking.upsert({
      where: { bookingNumber },
      update: {
        tenantId,
        customerId: customer.id,
        vehicleId: vehicle.id,
        branchId: branch.id,
        source: "AUTOHUB",
        status,
        bookingDate,
        confirmedAt: isConfirmed ? bookingDate : null,
        startedAt: isStarted ? bookingDate : null,
        completedAt: status === "COMPLETED" ? bookingDate : null,
        cancelledAt: status === "CANCELLED" ? bookingDate : null,
        noShowAt: status === "NO_SHOW" ? bookingDate : null,
      },
      create: {
        bookingNumber,
        tenantId,
        customerId: customer.id,
        vehicleId: vehicle.id,
        branchId: branch.id,
        source: "AUTOHUB",
        status,
        bookingDate,
        confirmedAt: isConfirmed ? bookingDate : null,
        startedAt: isStarted ? bookingDate : null,
        completedAt: status === "COMPLETED" ? bookingDate : null,
        cancelledAt: status === "CANCELLED" ? bookingDate : null,
        noShowAt: status === "NO_SHOW" ? bookingDate : null,
        items: {
          create: {
            serviceId: service.id,
            quantity: 1,
            unitPrice,
          },
        },
      },
    });

    const hasItem = await prisma.bookingItem.findFirst({
      where: { booking: { bookingNumber } },
      select: { id: true },
    });
    if (!hasItem) {
      await prisma.bookingItem.create({
        data: {
          booking: { connect: { bookingNumber } },
          service: { connect: { id: service.id } },
          quantity: 1,
          unitPrice,
        },
      });
    }
  }

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  periodEnd.setDate(0);
  periodEnd.setHours(23, 59, 59, 999);

  const serviceStoreIds = [...new Set(branches.map((branch) => branch.serviceStoreId))];
  for (const serviceStoreId of serviceStoreIds) {
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        branch: { serviceStoreId },
      },
      select: { id: true, bookingNumber: true, bookingDate: true },
      take: 20,
      orderBy: { bookingDate: "desc" },
    });
    const bookingCount = completedBookings.length;
    const bookingFee = new Prisma.Decimal(10);
    const subtotal = bookingFee.mul(bookingCount);
    const vatRate = new Prisma.Decimal(7);
    const vat = subtotal.mul(vatRate).div(100);
    const total = subtotal.add(vat);

    const billing = await prisma.billing.upsert({
      where: {
        serviceStoreId_periodStart_periodEnd: {
          serviceStoreId,
          periodStart,
          periodEnd,
        },
      },
      update: {
        bookingFee,
        vatRate,
        bookingCount,
        subtotal,
        vat,
        discount: new Prisma.Decimal(0),
        total,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      create: {
        serviceStoreId,
        periodStart,
        periodEnd,
        bookingFee,
        vatRate,
        bookingCount,
        subtotal,
        vat,
        discount: new Prisma.Decimal(0),
        total,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      select: { id: true },
    });

    await prisma.billingItem.deleteMany({ where: { billingId: billing.id } });
    if (completedBookings.length > 0) {
      await prisma.billingItem.createMany({
        data: completedBookings.map((booking) => ({
          billingId: billing.id,
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          bookingDate: booking.bookingDate,
          fee: bookingFee,
          amount: bookingFee,
        })),
      });
    }
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This seed is development-only.");
  }

  const prisma = createClient();
  try {
    const tenant = await seedTenant(prisma);
    await seedTenantRole(prisma, tenant.id);

    for (const serviceStore of MERCHANTS) {
      await seedServiceStore(prisma, tenant.id, serviceStore);
    }

    const serviceStores = await prisma.serviceStore.findMany({
      where: {
        tenantId: tenant.id,
        code: { in: MERCHANTS.map((serviceStore) => serviceStore.code) },
      },
      select: { id: true, code: true },
      orderBy: { code: "asc" },
    });

    await seedCustomersAndVehicles(prisma, tenant.id);
    await seedBookingsAndBilling(prisma, tenant.id);
    await seedServiceStoreClaims(
      prisma,
      tenant.id,
      serviceStores.map((serviceStore) => serviceStore.id),
    );

    const summary = {
      Bangkok: MERCHANTS.filter((serviceStore) => serviceStore.province === "Bangkok").length,
      Nonthaburi: MERCHANTS.filter((serviceStore) => serviceStore.province === "Nonthaburi").length,
      "Pathum Thani": MERCHANTS.filter((serviceStore) => serviceStore.province === "Pathum Thani").length,
      Total: MERCHANTS.length,
      Customers: 50,
      Vehicles: 80,
      Bookings: 200,
    };
    console.log("Development serviceStore seed completed.");
    console.log(summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Prisma seed failed:", error);
  process.exitCode = 1;
});
