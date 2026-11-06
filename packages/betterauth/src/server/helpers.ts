import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get current session from Next.js server headers
 */
export async function getServerSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Require specific user roles or throw unauthorized error
 */
export async function requireUserWithRole(allowedRoles: string[]) {
  const session = await getServerSession();

  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const userRole = (session.user as any).role || "user";
  if (!allowedRoles.includes(userRole)) {
    throw new Error(`FORBIDDEN: User role '${userRole}' does not have required permissions.`);
  }

  return session;
}

