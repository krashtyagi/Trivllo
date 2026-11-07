import { NextRequest, NextResponse } from "next/server";
import { getUserReviews, createReview } from "@/server/services/review.service";
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

    const data = await getUserReviews(user._id);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await createReview(user._id, body);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create review" },
      { status: 400 }
    );
  }
}

