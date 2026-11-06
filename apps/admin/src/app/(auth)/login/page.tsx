"use client";

import Auth07 from "@/components/watermelon-ui/auth-07";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/services/queryes";
import { useEffect } from "react";
import { adminAccessToken } from "@/services/auth";
import { ADMIN_ROLES } from "@/services/user.service";

export default function LoginPage() {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(adminAccessToken)
        : null;
    const user = data?.data;
    const role = user?.role;

    // Only redirect if intentionally logged in with an admin role
    if (token && user && ADMIN_ROLES.includes(role)) {
      if (role === "admin" || role === "super_admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/blog");
      }
    }
  }, [data, isLoading, router]);

  return <Auth07 />;
}