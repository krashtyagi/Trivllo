import { NextRequest, NextResponse } from "next/server";
import { getAllTourCompanies } from "@/server/services/tour.service";
import { getAuthUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const user = await getAuthUser(req);
    const result = await getAllTourCompanies(searchParams, user?._id);

    return NextResponse.json({
      success: true,
      data: result.companies,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error: any) {
    console.error("GET /api/v1/tours/companies error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tour companies" },
      { status: 500 }
    );
  }
}

