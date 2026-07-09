-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "Branch" ADD COLUMN "concurrentCapacity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "BranchOperatingHours" (
    "branchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BranchOperatingHours_pkey" PRIMARY KEY ("branchId","dayOfWeek")
);

-- AddForeignKey
ALTER TABLE "BranchOperatingHours" ADD CONSTRAINT "BranchOperatingHours_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default operating hours for existing branches
INSERT INTO "BranchOperatingHours" ("branchId", "dayOfWeek", "openTime", "closeTime", "isClosed")
SELECT
  b.id,
  dow,
  '09:00',
  '18:00',
  dow IN (0, 6)
FROM "Branch" b
CROSS JOIN generate_series(0, 6) AS dow;
