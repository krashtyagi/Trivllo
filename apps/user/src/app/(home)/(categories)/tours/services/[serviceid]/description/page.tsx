"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTourServiceDetails } from "@/services/tours/tours.queries";
import FullDescriptionView from "@/app/(home)/(categories)/_componentsRoot_categories/FullDescriptionView";
import { HotelPageSkeleton } from "@/components/ui/skeleton";

export default function TourServiceDescriptionPage() {
  const { serviceid: serviceIdParam } = useParams();
  const serviceId = Array.isArray(serviceIdParam) ? serviceIdParam[0] : serviceIdParam || "";
  const { data: tourServiceData, isLoading } = useTourServiceDetails(serviceId);

  if (isLoading || !tourServiceData?.data?.service) {
    return <HotelPageSkeleton />;
  }

  const service = tourServiceData.data.service;
  const company = tourServiceData.data.company;

  return (
    <FullDescriptionView
      name={service?.title || company?.name || "Tour Service"}
      description={service?.description || company?.description || ""}
      city={company?.city}
      address={company?.address}
      categoryName="tours/services"
      backUrl={`/tours/services/${serviceId}`}
    />
  );
}
