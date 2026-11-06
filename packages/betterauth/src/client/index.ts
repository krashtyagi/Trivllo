"use client";

import { createAuthClient as createClient } from "better-auth/react";
import { bearerClient } from "better-auth/client/plugins";

export function createBetterAuthClient(baseURL?: string) {
  const resolvedBaseUrl =
    baseURL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

  return createClient({
    baseURL: resolvedBaseUrl,
    plugins: [bearerClient()],
  });
}

export const authClient = createBetterAuthClient();

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
} = authClient;

