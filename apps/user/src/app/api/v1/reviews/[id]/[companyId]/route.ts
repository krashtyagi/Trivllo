import { NextRequest, NextResponse } from "next/server";
import { getCompanyReviews } from "@/server/services/review.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; companyId: string }> }
) {
  try {
    const { id: companyType, companyId } = await params;
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = await getCompanyReviews(companyType, companyId, searchParams);

    return NextResponse.json({
      success: true,
      data: result.reviews,
      total: result.total,
      stats: result.stats,
    });
  } catch (error: any) {
    console.error("GET /api/v1/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

