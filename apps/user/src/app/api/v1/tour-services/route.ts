import { NextRequest, NextResponse } from "next/server";
import { getTours } from "@/server/services/tour.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const user = await getAuthUser(req);
    const data = await getTours(searchParams, user?._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/tour-services error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

