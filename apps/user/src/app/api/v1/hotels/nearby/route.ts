import { NextRequest, NextResponse } from "next/server";
import { findNearbyHotels } from "@/server/services/hotel.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const lat = Number(req.nextUrl.searchParams.get("lat"));
    const lng = Number(req.nextUrl.searchParams.get("lng"));
    const radius = Number(req.nextUrl.searchParams.get("radius") || 2000);
    const limit = Number(req.nextUrl.searchParams.get("limit") || 20);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, message: "Valid lat and lng query params are required" },
        { status: 400 }
      );
    }

    const user = await getAuthUser(req);
    const hotels = await findNearbyHotels(lng, lat, radius, limit, user?._id);

    return NextResponse.json({
      success: true,
      count: hotels.length,
      radius,
      coordinates: [lng, lat],
      data: hotels,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/nearby error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch nearby hotels" },
      { status: 500 }
    );
  }
}

