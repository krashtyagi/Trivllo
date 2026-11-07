import { NextRequest, NextResponse } from "next/server";
import { getMyTripFavorites } from "@/server/services/favorite.service";
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

    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;

    const data = await getMyTripFavorites(user._id, page, limit);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/favorites/my-trip error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch trip favorites" },
      { status: 500 }
    );
  }
}

