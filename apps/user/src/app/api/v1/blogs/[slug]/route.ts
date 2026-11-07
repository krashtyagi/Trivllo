import { NextRequest, NextResponse } from "next/server";
import { getPublicPostBySlug } from "@/server/services/blog.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPublicPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error("GET /api/v1/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

