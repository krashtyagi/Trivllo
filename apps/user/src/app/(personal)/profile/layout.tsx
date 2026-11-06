"use client";

import { ProfileSidebar } from "./_components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "./_components/site-header";
import { cn } from "@/lib/utils";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import { ProfileSidebarProvider } from "../../../providers/ProfileSidebarProvider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabscn";
import { ErrorBoundary } from "react-error-boundary";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { LoaderOne } from "@/components/ui/acer-loader";
import { PageSkeleton } from "@/components/loader/skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { RouterPush } from "@/components/RouterPush";
import { useCurrentUser } from "@/services/hotel/querys";
import { userAccessToken } from "@/types/auth";
import { ProfileLayoutSkeleton } from "./_components/profile-skeleton";
export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useRouter();

  // Use a state for token to avoid hydration mismatch
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data, isLoading } = useCurrentUser()

  useEffect(() => {
    const storedToken = localStorage.getItem(userAccessToken);
    setToken(storedToken);
    setLoading(false);
    if (!isLoading && !data?.data && !storedToken) {
      RouterPush(navigate, '/');
    }
  }, [navigate, isLoading, data]);

  if (loading || isLoading) {
    return (
      <div className="w-full min-h-screen pt-6">
        <ProfileLayoutSkeleton />
      </div>
    );
  }

  if (!data?.data && !token) {
    return (
      <div className="w-full flex items-center justify-center">
        <p>Unauthorise</p>
        <LoaderOne />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<p>unauthenticated</p>}>
      <Suspense fallback={<div className="w-full min-h-screen pt-6">
        <ProfileLayoutSkeleton />
      </div>}>
        <ProfileSidebarProvider
          className={cn("flex flex-col md:flex-row gap-4 md:justify-center ")}
        >
          <TabsList className="grid h-auto w-fit shrink-0 grid-cols-1 gap-3 bg-transparent pt-0 ">
            <ProfileSidebar className="rounded-2xl gap-3 border-none " />
          </TabsList>
          {children}
        </ProfileSidebarProvider>
      </Suspense>
    </ErrorBoundary>

  );
}
