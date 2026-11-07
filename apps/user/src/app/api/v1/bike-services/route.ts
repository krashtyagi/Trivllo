import { NextRequest, NextResponse } from "next/server";
import { getBikes } from "@/server/services/bike.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = req.nextUrl;
    const query = {
      city: searchParams.get("city") || "",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    };

    const res = await getBikes(query, user?._id);

    return NextResponse.json({
      success: true,
      data: res.data,
      total: res.total,
      count: res.count,
    });
  } catch (error: any) {
    console.error("GET /api/v1/bike-services error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bike services" },
      { status: 500 }
    );
  }
}

