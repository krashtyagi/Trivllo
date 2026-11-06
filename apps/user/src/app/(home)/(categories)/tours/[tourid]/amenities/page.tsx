"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTourDetailsQuery } from "@/services/tours/tours.queries";
import FullAmenitiesView from "@/app/(home)/(categories)/_componentsRoot_categories/FullAmenitiesView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";

export default function TourAmenitiesPage() {
  const { tourid: tourIdParam } = useParams();
  const tourId = Array.isArray(tourIdParam) ? tourIdParam[0] : tourIdParam || "";
  const { data: tourDetailsData, isLoading } = useTourDetailsQuery(tourId);

  if (isLoading || !tourDetailsData?.data) {
    return <HotelPageSkeleton />;
  }

  const company = tourDetailsData.data.company;

  return (
    <FullAmenitiesView
      amenities={company?.features || []}
      title="Tour Features & Amenities"
      entityName={company?.name}
      categoryName="tours"
      backUrl={`/tours/${tourId}`}
    />
  );
}
