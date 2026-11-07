import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "@/server/services/hotel.service";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const suggestions = await getSuggestions(q);

    return NextResponse.json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error: any) {
    console.error("GET /api/v1/hotels/suggestions error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

