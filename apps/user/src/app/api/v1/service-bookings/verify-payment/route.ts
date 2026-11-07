import { NextRequest, NextResponse } from "next/server";
import { verifyServicePayment } from "@/server/services/service-booking.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await verifyServicePayment(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/v1/service-bookings/verify-payment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify service payment" },
      { status: 400 }
    );
  }
}

