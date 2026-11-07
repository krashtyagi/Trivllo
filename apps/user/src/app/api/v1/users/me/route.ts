import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/server/services/user.service";
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

    const profile = await getUserProfile(user._id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("GET /api/v1/users/me error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updated = await updateUserProfile(user._id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/v1/users/me error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}

