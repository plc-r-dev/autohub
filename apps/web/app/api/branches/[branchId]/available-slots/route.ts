import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking/engine/available-slots";

type RouteContext = {
  params: Promise<{ branchId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { branchId } = await context.params;
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId and date query parameters are required." },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(branchId, serviceId, date);

  return NextResponse.json({ slots });
}
