
"use client";

import { cn } from "@/lib/utils";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ScrollToTop } from "../../../../../../scrolltoto";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import HotelItems from "./_components/HotelItems";
import { HotelPageSkeleton, Skeleton } from "@/components/ui/skeleton";

import { MessageModal } from "@/components/messagemodal";
import { useIsMobile } from "@/hooks/use-mobile";
import TourDetailsContextProvider from "./_providers_context/TourDetailsContextProvider";
import { useParam } from "@/services/dailyfunctions";
import { useTourDetailsQuery } from "@/services/tours/tours.queries";

const HotelDetails = () => {
  const [isBookingMode, setIsBookingMode] = React.useState(false);
  const ismobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    try {
      localStorage.removeItem("nextRoute");
      localStorage.removeItem("like");
    } catch {}
  }, []);
  const { hotel: hotelIdParam } = useParams();

  const hotelId = useParam('tourid');

  React.useEffect(() => {
    if (hotelId) {
      if (
        searchParams.get("amenities") === "true" ||
        searchParams.get("features") === "true"
      ) {
        router.replace(`/tours/${hotelId}/amenities`);
      } else if (searchParams.get("description") === "true") {
        router.replace(`/tours/${hotelId}/description`);
      }
    }
  }, [searchParams, hotelId, router]);

  const { data: tourDetailsData, isLoading: tourDetailsLoading } =
    useTourDetailsQuery(hotelId);


  if (!tourDetailsData || !tourDetailsData.data || tourDetailsLoading) {
    return (
      <div className="w-full">
        <ScrollToTop />
        <HotelPageSkeleton />
      </div>
    );
  }





  return (
    <div className="w-full">
      <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
        <Suspense fallback={<HotelPageSkeleton />}>
          <ScrollToTop />
          <TourDetailsContextProvider tourid={hotelId}>
            <HotelItems
              data={tourDetailsData.data as any}
              loading={!tourDetailsData || !tourDetailsData.data || tourDetailsLoading}
              isBookingMode={isBookingMode}
            />
          </TourDetailsContextProvider>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};



export default HotelDetails;
