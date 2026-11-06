'use client'
import { AppSidebar } from "@/components/app-sidebar"

import { SiteHeader } from "@/components/site-header"
import { ErrorBoundary } from 'react-error-boundary'
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import { CompactFooter } from "@/components/footer/compactfooter"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LogoLoader from "@/components/loaders/logoloader"
import { ChartRangesProvider } from "@/context/auth/ChartRangesProvider"
import { vendorAccessToken } from "@/services/auth"

import { useCurrentUser } from "@/services/queryes"

export default function Page(
    { children }: { children: React.ReactNode }
) {
    const router = useRouter();
    const [ok, setOk] = useState(false);
    const { data: userRes, isLoading } = useCurrentUser();

    const user = userRes?.data;
    const isVendor = Boolean(user && (user.vendor || user.role === "vendor" || user.isVendor));
    const hasVendorToken = typeof window !== "undefined" && Boolean(localStorage.getItem(vendorAccessToken));

    useEffect(() => {
        if (isLoading) return;

        if (!hasVendorToken || !isVendor) {
            setOk(false);
            router.replace("/login");
        } else {
            setOk(true);
        }
    }, [hasVendorToken, isVendor, isLoading, router]);

    if (!ok || !hasVendorToken || !isVendor) return <LogoLoader />;
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 42)",
                    "--header-height": "calc(var(--spacing) * 19)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" className="bg-foreground/10 p-0" />
            <SidebarInset className="bg-gray-50 dark:bg-zinc-900">
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <SiteHeader />
                </ErrorBoundary>
                <ChartRangesProvider>

                    <div className="flex flex-1 flex-col px-2">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            {/* <div className="flex flex-col gap-4 p-2 md:gap-6 md:p-2  rounded-xl min-h-screen"> */}
                            {children}

                            {/* </div> */}
                            <CompactFooter />
                        </div>
                    </div>
                </ChartRangesProvider>
            </SidebarInset>
        </SidebarProvider>
    )
}
