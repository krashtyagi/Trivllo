"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTourServiceDetails } from "@/services/tours/tours.queries";
import FullAmenitiesView from "@/app/(home)/(categories)/_componentsRoot_categories/FullAmenitiesView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";

export default function TourServiceAmenitiesPage() {
  const { serviceid: serviceIdParam } = useParams();
  const serviceId = Array.isArray(serviceIdParam) ? serviceIdParam[0] : serviceIdParam || "";
  const { data: tourServiceData, isLoading } = useTourServiceDetails(serviceId);

  if (isLoading || !tourServiceData?.data?.service) {
    return <HotelPageSkeleton />;
  }

  const service = tourServiceData.data.service;
  const company = tourServiceData.data.company;

  return (
    <FullAmenitiesView
      amenities={service?.features || company?.features || []}
      title="Tour Service Features & Amenities"
      entityName={service?.title || company?.name}
      categoryName="tours/services"
      backUrl={`/tours/services/${serviceId}`}
    />
  );
}
