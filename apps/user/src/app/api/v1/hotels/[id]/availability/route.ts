import { NextRequest, NextResponse } from "next/server";
import { getHotelAvailability } from "@/server/services/hotel.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkIn = req.nextUrl.searchParams.get("checkIn");
    const checkOut = req.nextUrl.searchParams.get("checkOut");
    const adults = Number(req.nextUrl.searchParams.get("adults") || 1);
    const children = Number(req.nextUrl.searchParams.get("children") || 0);

    const data = await getHotelAvailability(
      id,
      checkIn,
      checkOut,
      adults,
      children
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/[id]/availability error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to check availability" },
      { status: 400 }
    );
  }
}

