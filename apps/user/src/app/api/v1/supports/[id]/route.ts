import { NextRequest, NextResponse } from "next/server";
import { getTicketDetail } from "@/server/services/support.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
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
    const data = await getTicketDetail(id, user._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/supports/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch ticket" },
      { status: 404 }
    );
  }
}

