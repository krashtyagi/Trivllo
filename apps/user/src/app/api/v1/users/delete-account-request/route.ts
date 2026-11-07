import { NextRequest, NextResponse } from "next/server";
import { deleteAccountRequest } from "@/server/services/user.service";
import { getAuthUser } from "@/server/auth.helper";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    // Sometimes frontend sends { params: { reason } } or { reason }
    const actualBody = body.params || body;
    const result = await deleteAccountRequest(user._id, actualBody);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("POST /api/v1/users/delete-account-request error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit deletion request" },
      { status: 400 }
    );
  }
}

