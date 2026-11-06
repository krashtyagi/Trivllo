'use client';
import FilterFramePages from "@/components/frame-pages/Filter-Frame-Page";
import { cn } from "@/lib/utils";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HotelContextProvider } from "@/context/hotel/HotelContextProvider";
import { MessageModal } from "@/components/messagemodal";
import { PageSkeleton } from "@/components/loader/skeleton";
import { hotelItems } from "@/constants/filter-constants";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

const SideBarFilter = dynamic(
  () => import("@/components/filter-bar/sidebar-filter").then((mod) => mod.SideBarFilter),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4 w-[270px] shrink-0 p-1">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    ),
  }
);

const ContentFrame = dynamic(
  () => import("./_components/content").then((mod) => mod.ContentFrame),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col gap-6 w-full">
        <div className="flex justify-between items-center px-4 sm:px-0">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-2xl p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

const FullPageMapView = dynamic(
  () => import("@/components/map/full-page-map").then((mod) => mod.FullPageMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 animate-pulse">
        <p className="text-sm text-muted-foreground font-medium">Loading full page map...</p>
      </div>
    ),
  }
);

const FindHotelsContent = () => {
  const searchParams = useSearchParams();
  const isMapOpen = searchParams.get("map-open") === "true";

  if (isMapOpen) {
    return <FullPageMapView />;
  }

  return (
    <FilterFramePages
      filterClassname="w-full flex gap-4 justify-center"
      filterSidebar={
        <SideBarFilter
          items={hotelItems}
          mapSrc="/map-icons/map.png"
          alt="map image"
          overlayTitle="See Location on Map"
        />
      }
      content={<ContentFrame />}
    />
  );
};

const FindHotels = () => {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Scenic Atmospheric Background with Soft Ambient Gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/hotels/main_page_bg.png')`,
          backgroundPosition: "center 18%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/85 to-white/95 dark:from-zinc-950/75 dark:via-zinc-950/90 dark:to-zinc-950/98 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full sm:px-0">
        <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
          <Suspense fallback={<PageSkeleton />}>
            <HotelContextProvider>
              <FindHotelsContent />
            </HotelContextProvider>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};
export default FindHotels;
