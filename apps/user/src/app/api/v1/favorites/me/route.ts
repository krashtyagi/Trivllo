import { NextRequest, NextResponse } from "next/server";
import { getUserFavorites } from "@/server/services/favorite.service";
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

    const itemType = req.nextUrl.searchParams.get("itemType") || undefined;
    const favorites = await getUserFavorites(user._id, itemType);

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    console.error("GET /api/v1/favorites/me error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

