"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useHotelDetailsQuery } from "@/services/hotel/querys";
import FullAmenitiesView from "@/app/(home)/(categories)/_componentsRoot_categories/FullAmenitiesView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";

export default function HotelAmenitiesPage() {
  const { hotel: hotelIdParam } = useParams();
  const hotelId = Array.isArray(hotelIdParam) ? hotelIdParam[0] : hotelIdParam || "";
  const { data: hotelDetailsData, isLoading } = useHotelDetailsQuery(hotelId);

  if (isLoading || !hotelDetailsData?.name) {
    return <HotelPageSkeleton />;
  }

  return (
    <FullAmenitiesView
      amenities={hotelDetailsData.amenities || []}
      title="Hotel Amenities & Facilities"
      entityName={hotelDetailsData.name}
      categoryName="hotels"
      backUrl={`/hotels/${hotelId}`}
    />
  );
}
