import { NextRequest, NextResponse } from "next/server";
import { getAdventures } from "@/server/services/adventure.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = req.nextUrl;
    const query = {
      city: searchParams.get("city") || undefined,
      category: searchParams.get("category") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    };

    const data = await getAdventures(query, user?._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/adventures error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch adventures" },
      { status: 500 }
    );
  }
}

