import { NextResponse } from "next/server";
import { fetchGooglePlaceDetails } from "@/lib/google-places/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId") ?? "";

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const place = await fetchGooglePlaceDetails(placeId);
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ place });
}
