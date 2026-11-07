import { NextRequest, NextResponse } from "next/server";
import { getPublicCategories } from "@/server/services/blog.service";

export async function GET(req: NextRequest) {
  try {
    const categories = await getPublicCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error("GET /api/v1/blogs/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

