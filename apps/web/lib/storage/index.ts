import { getPlatformSettings } from "@/lib/platform-settings/queries";
import { LocalStorageProvider } from "@/lib/storage/local-provider";
import type { StorageProvider } from "@/lib/storage/types";

export async function getStorageProvider(): Promise<StorageProvider> {
  const settings = await getPlatformSettings();

  switch (settings.storageProvider) {
    case "local":
      return new LocalStorageProvider();
    case "s3":
    case "r2":
    case "azure":
    case "gcs":
      throw new Error(
        `Storage provider "${settings.storageProvider}" is not implemented yet.`,
      );
    default:
      return new LocalStorageProvider();
  }
}
