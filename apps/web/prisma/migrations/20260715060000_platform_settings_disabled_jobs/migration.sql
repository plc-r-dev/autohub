-- Add disabledJobs to PlatformSettings for scheduler enable/disable.
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "disabledJobs" TEXT NOT NULL DEFAULT '[]';
