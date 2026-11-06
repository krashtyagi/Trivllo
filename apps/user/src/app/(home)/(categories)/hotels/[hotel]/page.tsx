"use client";

import { cn } from "@/lib/utils";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ScrollToTop } from "../../../../../../scrolltoto";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import HotelItems from "./_components/HotelItems";
import { useHotelStore } from "@/store/hotel.store";
import { HotelPageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useHotelDetailsQuery } from "@/services/hotel/querys";
import HotelContextProvider from "./_providers_context/hotel-contextProvider";
import { MessageModal } from "@/components/messagemodal";
import { useIsMobile } from "@/hooks/use-mobile";

const HotelDetails = () => {
  const { date, guests } = useHotelStore();
  const isBookingMode = !!date?.from && !!date?.to;
  const ismobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    try {
      localStorage.removeItem("nextRoute");
      localStorage.removeItem("like");
    } catch {}

    if (typeof window !== "undefined" && !(window as any).__hasLoadedApp) {
      useHotelStore.getState().setDate(undefined);
    }
  }, []);

  const { hotel: hotelIdParam } = useParams();

  const hotelId = Array.isArray(hotelIdParam)
    ? hotelIdParam[0]
    : hotelIdParam || "";

  React.useEffect(() => {
    if (hotelId) {
      if (
        searchParams.get("amenities") === "true" ||
        searchParams.get("features") === "true"
      ) {
        router.replace(`/hotels/${hotelId}/amenities`);
      } else if (searchParams.get("description") === "true") {
        router.replace(`/hotels/${hotelId}/description`);
      }
    }
  }, [searchParams, hotelId, router]);

  const { data: hotelDetailsData } = useHotelDetailsQuery(hotelId);

  if (!hotelDetailsData || !hotelDetailsData.name) {
    return (
      <div className="w-full">
        <ScrollToTop />
        <HotelPageSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ErrorBoundary
        fallback={
          <MessageModal title="Error" description="Something went wrong" />
        }
      >
        <Suspense fallback={<HotelPageSkeleton />}>
          <ScrollToTop />
          <HotelContextProvider hotelId={hotelId}>
            <HotelItems
              hotel={hotelDetailsData as any}
              loading={!hotelDetailsData || !hotelDetailsData.name}
              isBookingMode={isBookingMode}
            />
          </HotelContextProvider>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default HotelDetails;
