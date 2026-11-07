import { NextRequest, NextResponse } from "next/server";
import { getMyTickets, createTicket } from "@/server/services/support.service";
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

    const { searchParams } = req.nextUrl;
    const query = {
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      status: searchParams.get("status") || undefined,
    };

    const data = await getMyTickets(user._id, query);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/supports error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tickets" },
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
    const ticket = await createTicket(body, user._id);

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket created successfully",
        data: ticket,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/supports error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create ticket" },
      { status: 400 }
    );
  }
}

