"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { userAccessToken } from "@/types/auth";
import { clearBookingDates } from "@/store/auth.store";
import { getSession } from "@/lib/auth-client";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      const msg = errorDescription || error;
      toast.error(`Authentication failed: ${msg.replace(/_/g, " ")}`);
      window.location.href = "/";
      return;
    }

    const processAuth = async () => {
      let token = searchParams.get("token");

      if (!token) {
        try {
          const session = await getSession();
          if (session?.data) {
            token =
              (session.data as any)?.token ||
              (session.data as any)?.session?.token;
          }
        } catch (e) {}
      }

      localStorage.setItem(userAccessToken, token || "better-auth-session");
      clearBookingDates();
      toast.success("Successfully logged in!");

      const nextRoute = localStorage.getItem("nextRoute");
      if (nextRoute) {
        localStorage.removeItem("nextRoute");
        window.location.href = nextRoute;
      } else {
        window.location.href = "/";
      }
    };

    processAuth();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
