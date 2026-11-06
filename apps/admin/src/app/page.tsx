'use client'
import { SpinnerCustom } from "@/components/loaders/smallSpinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/services/queryes";
import { useAuthStore } from "@/stores/auth.store";
import { PageSkeleton } from "@/components/loaders/loader/skeleton";
import { adminAccessToken } from "@/services/auth";

import { ADMIN_ROLES } from "@/services/user.service";

export default function Home() {
  const { data, isLoading, isFetching, refetch } = useCurrentUser();
  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(adminAccessToken)
      : null;
  const user = data?.data;
  const role = user?.role;

  useEffect(() => {
    if (token && !user && !isLoading && !isFetching) {
      refetch();
    }
  }, [token, user, isLoading, isFetching, refetch]);

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (token && user && ADMIN_ROLES.includes(role)) {
      if (role === "admin" || role === "super_admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/blog");
      }
    } else if (!token || (!isFetching && !user)) {
      router.replace("/login");
    }
  }, [data, isLoading, isFetching, token, role, user, router]);
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If not mounted, return the EXACT same skeleton the server does
  // or return null to let the browser handle it quietly
  if (!isMounted) {
    return <PageSkeleton />
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <SpinnerCustom /> loading
    </div>
  );
}
