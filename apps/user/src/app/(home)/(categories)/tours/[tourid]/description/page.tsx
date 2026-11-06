"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTourDetailsQuery } from "@/services/tours/tours.queries";
import FullDescriptionView from "@/app/(home)/(categories)/_componentsRoot_categories/FullDescriptionView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";

export default function TourDescriptionPage() {
  const { tourid: tourIdParam } = useParams();
  const tourId = Array.isArray(tourIdParam) ? tourIdParam[0] : tourIdParam || "";
  const { data: tourDetailsData, isLoading } = useTourDetailsQuery(tourId);

  if (isLoading || !tourDetailsData?.data) {
    return <HotelPageSkeleton />;
  }

  const company = tourDetailsData.data.company;

  return (
    <FullDescriptionView
      name={company?.name || "Tour Overview"}
      description={company?.description || ""}
      city={company?.city}
      address={company?.address}
      categoryName="tours"
      backUrl={`/tours/${tourId}`}
    />
  );
}
