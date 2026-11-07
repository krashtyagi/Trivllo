import { NextRequest, NextResponse } from "next/server";
import { getHomeHotels } from "@/server/services/hotel.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const user = await getAuthUser(req);
    const result = await getHomeHotels(searchParams, user?._id);

    return NextResponse.json({
      success: true,
      count: result.hotels.length,
      data: result.hotels,
      sections: result.sections,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/home error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch home hotels" },
      { status: 500 }
    );
  }
}

