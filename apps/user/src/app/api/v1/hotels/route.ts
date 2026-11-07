import { NextRequest, NextResponse } from "next/server";
import { getAllHotels } from "@/server/services/hotel.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const user = await getAuthUser(req);
    const { hotels, total } = await getAllHotels(searchParams, user?._id);

    return NextResponse.json({
      success: true,
      count: hotels.length,
      total,
      data: hotels,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}

