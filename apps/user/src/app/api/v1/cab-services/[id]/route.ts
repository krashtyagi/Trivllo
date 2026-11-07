import { NextRequest, NextResponse } from "next/server";
import { getCabServiceDetails } from "@/server/services/cab.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const data = await getCabServiceDetails(id, user?._id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/cab-services/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch cab service" },
      { status: 404 }
    );
  }
}

