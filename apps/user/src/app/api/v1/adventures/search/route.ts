import { NextRequest, NextResponse } from "next/server";
import { searchAdventures } from "@/server/services/adventure.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = req.nextUrl;
    const query = {
      city: searchParams.get("city") || undefined,
    };

    const data = await searchAdventures(query, user?._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/adventures/search error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to search adventures" },
      { status: 500 }
    );
  }
}

