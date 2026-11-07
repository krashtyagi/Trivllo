import { NextRequest, NextResponse } from "next/server";
import { getFavoritesSummary } from "@/server/services/favorite.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const summary = await getFavoritesSummary(user._id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("GET /api/v1/favorites/summary error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch favorites summary" },
      { status: 500 }
    );
  }
}

