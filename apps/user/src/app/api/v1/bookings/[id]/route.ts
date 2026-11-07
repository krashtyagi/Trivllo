import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/server/services/booking.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    const booking = await getBookingById(id, user?._id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("GET /api/v1/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

