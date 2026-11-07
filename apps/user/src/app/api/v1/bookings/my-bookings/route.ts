import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/server/services/booking.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookings = await getUserBookings(user._id);

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    console.error("GET /api/v1/bookings/my-bookings error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

