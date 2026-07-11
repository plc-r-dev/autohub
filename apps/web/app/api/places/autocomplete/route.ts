import { NextResponse } from "next/server";
import { autocompleteGooglePlaces } from "@/lib/google-places/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const suggestions = await autocompleteGooglePlaces(query);
  return NextResponse.json({ suggestions });
}
