import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/server/services/booking.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await verifyPayment(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/v1/payments/verify error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify payment" },
      { status: 400 }
    );
  }
}

