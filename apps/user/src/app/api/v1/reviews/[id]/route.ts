import { NextRequest, NextResponse } from "next/server";
import { updateReview } from "@/server/services/review.service";
import { getAuthUser } from "@/server/auth.helper";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const result = await updateReview(user._id, id, body);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.review,
    });
  } catch (error: any) {
    console.error("PUT /api/v1/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update review" },
      { status: 400 }
    );
  }
}

