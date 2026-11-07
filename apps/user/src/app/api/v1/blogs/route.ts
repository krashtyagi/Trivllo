import { NextRequest, NextResponse } from "next/server";
import { getPublicPosts } from "@/server/services/blog.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = {
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      search: searchParams.get("search") || undefined,
      featured: searchParams.get("featured") || undefined,
    };

    const result = await getPublicPosts(query);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("GET /api/v1/blogs error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

