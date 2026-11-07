import { NextRequest, NextResponse } from "next/server";
import { getCabs } from "@/server/services/cab.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = req.nextUrl;
    const query = {
      pickup: searchParams.get("pickup") || "",
      drop: searchParams.get("drop") || "",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    };

    const res = await getCabs(query, user?._id);

    return NextResponse.json({
      success: true,
      data: res.data,
      total: res.total,
      count: res.count,
    });
  } catch (error: any) {
    console.error("GET /api/v1/cab-services error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch cab services" },
      { status: 500 }
    );
  }
}

