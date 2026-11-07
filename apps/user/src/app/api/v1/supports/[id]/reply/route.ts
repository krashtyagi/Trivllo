import { NextRequest, NextResponse } from "next/server";
import { replyToTicket } from "@/server/services/support.service";
import { getAuthUser } from "@/server/auth.helper";

export async function POST(
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
    const message = body.message || body.reply;

    const ticket = await replyToTicket(id, user._id, message);

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: ticket,
    });
  } catch (error: any) {
    console.error("POST /api/v1/supports/[id]/reply error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send reply" },
      { status: 400 }
    );
  }
}

