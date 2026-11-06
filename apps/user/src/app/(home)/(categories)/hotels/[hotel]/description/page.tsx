"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useHotelDetailsQuery } from "@/services/hotel/querys";
import FullDescriptionView from "@/app/(home)/(categories)/_componentsRoot_categories/FullDescriptionView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";
import { formatAddress } from "@/lib/utils";

export default function HotelDescriptionPage() {
  const { hotel: hotelIdParam } = useParams();
  const hotelId = Array.isArray(hotelIdParam) ? hotelIdParam[0] : hotelIdParam || "";
  const { data: hotelDetailsData, isLoading } = useHotelDetailsQuery(hotelId);

  if (isLoading || !hotelDetailsData?.name) {
    return <HotelPageSkeleton />;
  }

  return (
    <FullDescriptionView
      name={hotelDetailsData.name}
      description={hotelDetailsData.description || ""}
      city={hotelDetailsData.city}
      address={formatAddress(hotelDetailsData.address)}
      categoryName="hotels"
      backUrl={`/hotels/${hotelId}`}
    />
  );
}
