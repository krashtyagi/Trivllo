import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/server/services/booking.service";
import { getAuthUser } from "@/server/auth.helper";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    const result = await createBooking(body, user?._id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/v1/bookings error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status: 400 }
    );
  }
}

