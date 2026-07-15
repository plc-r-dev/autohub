-- Platform settings media + language fields for tabbed settings workspace.
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "companyLogoKey" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "promptPayQrKey" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
