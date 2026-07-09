import { readdir, rm } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

function getUploadRoot(): string {
  return path.join(process.cwd(), "storage", "uploads");
}

async function walkFiles(dir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const keys: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      keys.push(...(await walkFiles(absolutePath, baseDir)));
      continue;
    }
    if (entry.isFile()) {
      const relative = path.relative(baseDir, absolutePath).split(path.sep).join("/");
      keys.push(relative);
    }
  }
  return keys;
}

export async function runStorageCleanupService() {
  const uploadRoot = getUploadRoot();
  const [allLocalKeys, referenced] = await Promise.all([
    walkFiles(uploadRoot, uploadRoot),
    prisma.billingPayment.findMany({
      select: { slipKey: true },
    }),
  ]);

  const usedKeys = new Set(referenced.map((row) => row.slipKey));
  const orphanKeys = allLocalKeys.filter((key) => !usedKeys.has(key));

  await Promise.all(
    orphanKeys.map((key) =>
      rm(path.join(uploadRoot, key), {
        force: true,
      }),
    ),
  );

  return { deletedCount: orphanKeys.length };
}
