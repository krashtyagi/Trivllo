import { NextRequest, NextResponse } from "next/server";
import { getTourServiceDetails } from "@/server/services/tour.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    const data = await getTourServiceDetails(id, user?._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/tour-services/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Tour service not found" },
      { status: 404 }
    );
  }
}

