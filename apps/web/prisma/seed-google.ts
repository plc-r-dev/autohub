import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "@/lib/generated/prisma/client";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Pool } from "pg";
import { mapGooglePlaceToMerchant } from "@/lib/google/google-mapper";
import { searchCarWashesByProvince } from "@/lib/google/google-places";

const TARGETS = [
  { province: "Bangkok", limit: 5 },
  { province: "Nonthaburi", limit: 5 },
  { province: "Pathum Thani", limit: 5 },
] as const;

const DEFAULT_SERVICES = [
  { code: "BASIC_WASH", name: "Basic Wash", duration: 30, price: 200, buffer: 5 },
  { code: "VACUUM", name: "Vacuum", duration: 20, price: 100, buffer: 0 },
  { code: "WASH_VACUUM", name: "Wash + Vacuum", duration: 45, price: 280, buffer: 5 },
  { code: "PREMIUM_WASH", name: "Premium Wash", duration: 60, price: 500, buffer: 10 },
  { code: "WAX", name: "Wax", duration: 45, price: 700, buffer: 10 },
] as const;

type ImportResult = {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  merchants: string[];
};

function slug(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function ensureTenant(prisma: PrismaClient) {
  return prisma.tenant.upsert({
    where: { code: "AUTOHUB" },
    create: {
      code: "AUTOHUB",
      name: "AutoHub",
      status: "ACTIVE",
    },
    update: {
      name: "AutoHub",
      status: "ACTIVE",
    },
    select: { id: true },
  });
}

async function upsertServices(prisma: PrismaClient, branchId: string) {
  for (const service of DEFAULT_SERVICES) {
    await prisma.service.upsert({
      where: {
        branchId_code: {
          branchId,
          code: service.code,
        },
      },
      create: {
        branchId,
        code: service.code,
        name: service.name,
        duration: service.duration,
        price: new Prisma.Decimal(service.price),
        bufferMinutes: service.buffer,
        isActive: true,
      },
      update: {
        name: service.name,
        duration: service.duration,
        price: new Prisma.Decimal(service.price),
        bufferMinutes: service.buffer,
        isActive: true,
      },
    });
  }
}

async function replaceOperatingHours(
  prisma: PrismaClient,
  branchId: string,
  openingHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>,
) {
  await prisma.branchOperatingHours.deleteMany({ where: { branchId } });
  await prisma.branchOperatingHours.createMany({
    data: openingHours.map((hour) => ({
      branchId,
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
    })),
  });
}

async function upsertMerchantFromPlace(
  prisma: PrismaClient,
  tenantId: string,
  province: string,
  place: Awaited<ReturnType<typeof searchCarWashesByProvince>>[number],
): Promise<"imported" | "updated" | "skipped"> {
  const mapped = mapGooglePlaceToMerchant(place);
  const existing = await prisma.merchant.findUnique({
    where: { googlePlaceId: mapped.googlePlaceId },
    select: { id: true, code: true, branches: { select: { id: true }, take: 1 } },
  });

  if (!existing) {
    const merchantCode = `GOOGLE-${slug(mapped.googlePlaceId)}`;
    const merchant = await prisma.merchant.create({
      data: {
        tenantId,
        code: merchantCode,
        googlePlaceId: mapped.googlePlaceId,
        name: mapped.businessName,
        description: "Imported from Google Places",
        phone: mapped.phoneNumber,
        website: mapped.website,
        googleRating:
          mapped.rating === null ? null : new Prisma.Decimal(mapped.rating.toFixed(1)),
        googleReviewCount: mapped.reviewCount,
        googleMapsUrl: mapped.googleMapsUrl,
        photoReferences: mapped.photoReferences,
        status: "ACTIVE",
        branches: {
          create: {
            code: "MAIN",
            name: `${mapped.businessName} - ${province}`,
            phone: mapped.phoneNumber,
            address: mapped.formattedAddress,
            latitude:
              mapped.latitude === null ? null : new Prisma.Decimal(mapped.latitude.toString()),
            longitude:
              mapped.longitude === null ? null : new Prisma.Decimal(mapped.longitude.toString()),
            slotIntervalMinutes: 15,
            concurrentCapacity: 2,
          },
        },
      },
      select: { id: true, branches: { select: { id: true }, take: 1 } },
    });

    const branchId = merchant.branches[0]?.id;
    if (branchId) {
      await replaceOperatingHours(prisma, branchId, mapped.openingHours);
      await upsertServices(prisma, branchId);
    }
    return "imported";
  }

  await prisma.merchant.update({
    where: { id: existing.id },
    data: {
      name: mapped.businessName,
      phone: mapped.phoneNumber,
      website: mapped.website,
      googleRating: mapped.rating === null ? null : new Prisma.Decimal(mapped.rating.toFixed(1)),
      googleReviewCount: mapped.reviewCount,
      googleMapsUrl: mapped.googleMapsUrl,
      photoReferences: mapped.photoReferences,
      description: "Imported from Google Places",
      status: "ACTIVE",
    },
  });

  const branchId = existing.branches[0]?.id;
  if (!branchId) {
    return "skipped";
  }

  await prisma.branch.update({
    where: { id: branchId },
    data: {
      name: `${mapped.businessName} - ${province}`,
      phone: mapped.phoneNumber,
      address: mapped.formattedAddress,
      latitude: mapped.latitude === null ? null : new Prisma.Decimal(mapped.latitude.toString()),
      longitude:
        mapped.longitude === null ? null : new Prisma.Decimal(mapped.longitude.toString()),
      slotIntervalMinutes: 15,
      concurrentCapacity: 2,
    },
  });
  await replaceOperatingHours(prisma, branchId, mapped.openingHours);
  await upsertServices(prisma, branchId);
  return "updated";
}

async function run() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Google importer is development-only and cannot run in production.");
  }

  const startedAt = Date.now();
  const prisma = createPrismaClient();
  const result: ImportResult = {
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    merchants: [],
  };
  const perProvince = new Map<string, number>();

  try {
    const tenant = await ensureTenant(prisma);

    for (const target of TARGETS) {
      const places = await searchCarWashesByProvince(target.province, target.limit);
      let count = 0;
      for (const place of places) {
        try {
          const status = await upsertMerchantFromPlace(
            prisma,
            tenant.id,
            target.province,
            place,
          );
          if (status === "imported") {
            result.imported += 1;
            const name = place.displayName?.text?.trim();
            if (name) {
              result.merchants.push(name);
            }
          } else if (status === "updated") {
            result.updated += 1;
          } else {
            result.skipped += 1;
          }
          count += 1;
        } catch (error) {
          result.failed += 1;
          console.error("Google importer failed for place:", {
            province: target.province,
            placeId: place.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      perProvince.set(target.province, count);
    }

    const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log("Google Places Import");
    console.log(`Bangkok ............. ${perProvince.get("Bangkok") ?? 0}`);
    console.log(`Nonthaburi .......... ${perProvince.get("Nonthaburi") ?? 0}`);
    console.log(`Pathum Thani ........ ${perProvince.get("Pathum Thani") ?? 0}`);
    console.log("--------------------------");
    console.log(`Total Imported ...... ${result.imported}`);
    console.log(`Updated ............. ${result.updated}`);
    console.log(`Skipped ............. ${result.skipped}`);
    console.log(`Failed .............. ${result.failed}`);
    console.log(`Execution Time ...... ${elapsedSeconds} s`);
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

run().catch((error) => {
  console.error("seed-google failed:", error);
  process.exitCode = 1;
});
