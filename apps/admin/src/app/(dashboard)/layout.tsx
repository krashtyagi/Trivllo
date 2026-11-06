'use client'
import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LogoLoader from "@/components/loaders/logoloader"
import { useVariants } from "@/providers/main-provider/variants-provider"
import { ErrorBoundary } from 'react-error-boundary'
import { CompactFooter } from "@/components/footer/compactfooter"
import { adminAccessToken } from "@/services/auth"
import { useCurrentUser } from "@/services/queryes"
import { ADMIN_ROLES } from "@/services/user.service"

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);
  const { variant } = useVariants();
  const { data: userRes, isLoading, isFetching, refetch } = useCurrentUser();

  const user = userRes?.data;
  const role = user?.role;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(adminAccessToken)
      : null;

  const hasValidAdminSession = Boolean(
    token &&
    user &&
    ADMIN_ROLES.includes(role)
  );

  // If admin token is stored in localStorage but user query hasn't populated, refetch
  useEffect(() => {
    if (token && !user && !isLoading && !isFetching) {
      refetch();
    }
  }, [token, user, isLoading, isFetching, refetch]);

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (!token || !hasValidAdminSession) {
      setOk(false);
      router.replace("/login");
    } else {
      setOk(true);
    }
  }, [hasValidAdminSession, isLoading, isFetching, token, router]);

  useEffect(() => {
    if (!hasValidAdminSession) return;

    if (role && role !== "admin" && role !== "super_admin") {
      const marketRoutes = ["/blog", "/blog-categories", "/writers"];
      const allowed = marketRoutes.some((route) => pathname.startsWith(route));
      if (!allowed) {
        router.replace("/blog");
      }
    }
  }, [hasValidAdminSession, role, pathname, router]);

  if (!ok || !hasValidAdminSession) return <LogoLoader />;
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 52)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant={variant} className="border-border bg-background" />
      <SidebarInset className="bg-gray-50 dark:bg-zinc-900 overflow-x-hidden">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <SiteHeader />
        </ErrorBoundary>
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-2 px-1 sm:px-3 md:gap-6 md:py-6 md:px-6 rounded-xl min-h-screen">
              {children}
            </div>
            <CompactFooter />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
