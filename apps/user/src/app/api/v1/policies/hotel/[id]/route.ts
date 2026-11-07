import { NextRequest, NextResponse } from "next/server";
import { getPolicyByHotel } from "@/server/services/policy.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const policy = await getPolicyByHotel(id);

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error("GET /api/v1/policies/hotel/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch policy" },
      { status: 500 }
    );
  }
}

