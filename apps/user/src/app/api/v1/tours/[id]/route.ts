import { NextRequest, NextResponse } from "next/server";
import { getTourCompanyById } from "@/server/services/tour.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    const company = await getTourCompanyById(id, user?._id);

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error("GET /api/v1/tours/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Tour company not found" },
      { status: 404 }
    );
  }
}

