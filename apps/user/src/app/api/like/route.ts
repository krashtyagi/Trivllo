import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { id, liked, token } = await req.json();

    if (!id || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await inngest.send({
      name: "app/like.toggled",
      data: { id, liked, token },
    });

    return NextResponse.json({ success: true, message: "Like job dispatched" });
  } catch (error) {
    console.error("Error dispatching like job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
