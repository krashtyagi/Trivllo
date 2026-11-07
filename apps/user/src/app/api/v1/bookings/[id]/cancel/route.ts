import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/server/services/booking.service";
import { getAuthUser } from "@/server/auth.helper";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    const updated = await cancelBooking(id, user?._id);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/v1/bookings/[id]/cancel error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}

