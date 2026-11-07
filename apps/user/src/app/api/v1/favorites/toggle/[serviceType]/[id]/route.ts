import { NextRequest, NextResponse } from "next/server";
import { toggleFavorite } from "@/server/services/favorite.service";
import { getAuthUser } from "@/server/auth.helper";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ serviceType: string; id: string }> }
) {
  try {
    const { serviceType, id } = await params;
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await toggleFavorite(user._id, id, serviceType);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("POST /api/v1/favorites/toggle error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}

