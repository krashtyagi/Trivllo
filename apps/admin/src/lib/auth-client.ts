import { createAuthClient } from "better-auth/react";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1\/?$/, "");

export const authClient = createAuthClient({
  baseURL: apiBase,
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
