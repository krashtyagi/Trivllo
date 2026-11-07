import { NextRequest, NextResponse } from "next/server";
import { getHotelDetails } from "@/server/services/hotel.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    const hotel = await getHotelDetails(id, user?._id);

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch hotel details" },
      { status: 404 }
    );
  }
}

