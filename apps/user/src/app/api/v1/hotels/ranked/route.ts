import { NextRequest, NextResponse } from "next/server";
import { getRankedHotels } from "@/server/services/hotel.service";

export async function GET(req: NextRequest) {
  try {
    const rank = req.nextUrl.searchParams.get("rank") || "A";
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") || 10);

    const result = await getRankedHotels(rank, page, limit);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/ranked error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch ranked hotels" },
      { status: 500 }
    );
  }
}

