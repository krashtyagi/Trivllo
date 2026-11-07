import { auth } from "@repo/betterauth";
import { connectDB, User } from "@repo/database";
import mongoose from "mongoose";

export async function getAuthUser(req: Request) {
  try {
    await connectDB();

    // 1. Better-Auth getSession (handles cookie & Bearer token plugins)
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (session?.user?.id) {
        const user = await User.findById(session.user.id).lean();
        if (user) return user;
      }
    } catch {
      // Continue to token fallback
    }

    // 2. Direct database session query for Bearer token stored in localStorage
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token && token !== "better-auth-session") {
        const db = mongoose.connection.db;
        if (db) {
          const sessionDoc = await db.collection("session").findOne({
            token,
            expiresAt: { $gt: new Date() },
          });

          if (sessionDoc?.userId) {
            let user = await User.findById(sessionDoc.userId).lean();
            if (!user && mongoose.isValidObjectId(sessionDoc.userId)) {
              user = await User.findById(
                new mongoose.Types.ObjectId(sessionDoc.userId)
              ).lean();
            }
            if (user) return user;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in getAuthUser:", error);
  }

  return null;
}

