import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getLocalFilePath } from "@/lib/storage/local-provider";
import { verifyStorageSignature } from "@/lib/storage/signed-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expires = Number(searchParams.get("expires"));
  const signature = searchParams.get("sig");

  if (!key || !expires || !signature) {
    return NextResponse.json({ error: "Invalid signed URL." }, { status: 400 });
  }

  if (!verifyStorageSignature(key, expires, signature)) {
    return NextResponse.json({ error: "Signed URL expired or invalid." }, { status: 403 });
  }

  try {
    const filePath = getLocalFilePath(key);
    const fileBuffer = await readFile(filePath);
    const extension = key.split(".").pop()?.toLowerCase();
    const contentType =
      extension === "pdf"
        ? "application/pdf"
        : extension === "png"
          ? "image/png"
          : "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
