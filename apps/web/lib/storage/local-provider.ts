import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { StorageProvider, UploadInput, UploadResult } from "@/lib/storage/types";
import { buildSignedStorageUrl } from "@/lib/storage/signed-url";

function getUploadRoot(): string {
  return path.join(process.cwd(), "storage", "uploads");
}

function resolveFilePath(key: string): string {
  const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(getUploadRoot(), normalized);
}

export class LocalStorageProvider implements StorageProvider {
  async upload(input: UploadInput): Promise<UploadResult> {
    const filePath = resolveFilePath(input.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from(input.body));

    return {
      key: input.key,
      url: buildSignedStorageUrl(input.key),
      fileSize: input.body.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = resolveFilePath(key);
    try {
      await unlink(filePath);
    } catch {
      // Ignore missing files during delete.
    }
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return buildSignedStorageUrl(key, expiresInSeconds);
  }
}

export function getLocalFilePath(key: string): string {
  return resolveFilePath(key);
}
