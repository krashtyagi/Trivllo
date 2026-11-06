import { auth } from "@repo/betterauth";
import { connectDB } from "@repo/database";

export interface ORPCContext {
  req: Request;
  headers: Headers;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    isVendor?: boolean;
    firstName?: string;
    lastName?: string;
  } | null;
  session: any | null;
}

export async function createORPCContext(req: Request): Promise<ORPCContext> {
  // Ensure DB is connected in serverless
  await connectDB();

  let session = null;
  let user = null;

  try {
    session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session && session.user) {
      user = session.user as any;
    }
  } catch (err) {
    // Session optional for public procedures
  }

  return {
    req,
    headers: req.headers,
    user,
    session,
  };
}

