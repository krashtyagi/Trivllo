"use client";

import React, { useEffect, useRef, useState } from "react";
import { LayoutGridDemo } from "../../../_componentsRoot_categories/imsges";
import { Decription } from "../../../_componentsRoot_categories/description";
import { TourServicesMain } from "./rooms";
import SliderIfNotChooseDate from "../_providers_context/SliderIfNotChooseDate";
// import { RentalData } from "../_providers_context/TourDetailsContextProvider";
import Policies from "./policies";
import { ToursData } from "../_providers_context/TourDetailsContextProvider";
import ChangelogComponentPage from "../../../_componentsRoot_categories/timelinedemo";
import ReviewsMain from "../../../_componentsRoot_categories/reviews";
import AmenitiesValues from "../../../_componentsRoot_categories/amanities";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type TabKey =
  | "overview"
  | "description"
  // | "location"
  | "rooms"
  | "amenities"
  | "reviews";

export function TabsLine({
  values,
  data,
  isBookingMode,
  isAvailabilityLoading,
}: {
  values: { title: TabKey; id: number }[];
  data: ToursData;
  isBookingMode: boolean;
  isAvailabilityLoading: boolean;
}) {
  const isNavHidden = useScrollDirection();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  if (!data) return null;
  const companyId = data.company?.companyId;

  const content: Record<TabKey, React.ReactNode> = {
    overview: <LayoutGridDemo images={data.company.images} />,
    description: (
      <Decription
        data={{
          name: data.company.name,
          description: data.company.description,
        }}
      />
    ),
    // location: (
    //   <MapLocation
    //     address={data.company.address}
    //     cordinates={data.company.location.coordinates}
    //     map="/map.png"
    //   />
    // ),
    amenities: <AmenitiesValues amenities={data.company.features} title="" />,
    reviews: <ReviewsMain companyId={companyId} CompanyType="tour" />,

    rooms: (
      <TourServicesMain
        services={data.services}
        isBookingMode={isBookingMode}
        isLoading={isAvailabilityLoading}
      />
    ),
  };

  const handleClick = () =>
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const tabItems = [
    { key: "overview", label: "Overview", id: "overview" },
    { key: "description", label: "Description", id: "description" },
    { key: "rooms", label: "Available Tours", id: "rooms" },
    { key: "amenities", label: "Features", id: "amenities" },
    { key: "reviews", label: "Reviews", id: "reviews" },
    { key: "policies", label: "Policies", id: "policies" },
  ];

  const handleTabClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = isNavHidden ? 60 : 120;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    const duration = 600;
    let start: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, offsetPosition);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <section id="overview" className="py-3">
          {content.overview}
        </section>
      </div>

      {/* Full-width sticky bar edge-to-edge */}
      <div
        className={cn(
          "sticky z-30 w-full bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-t border-border shadow-xs mb-8 transition-all duration-300 ease-in-out",
          isNavHidden ? "top-0" : "top-14 md:top-16",
        )}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10 h-12 md:h-14 flex items-center">
          <div className="flex gap-6 overflow-x-auto no-scrollbar items-center w-full">
            {tabItems.map((tab) => (
              <a
                key={tab.key}
                href={`#${tab.id}`}
                className="capitalize whitespace-nowrap pb-2 border-b-2 border-transparent hover:border-orange-500 text-sm font-semibold transition-all text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-primary cursor-pointer"
                onClick={(e) => handleTabClick(e, tab.id)}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:gap-6 mb-5">
          <main className="flex-1 space-y-5 border-b-1 mb-4">
            <section id="description" className="scroll-mt-24 py-2 gap-2">
              <h3 className="text-base sm:text-lg font-bold mb-1.5 dark:text-zinc-400 text-zinc-800">
                Description
              </h3>
              {content.description}
            </section>
            <section
              id="amenities"
              className="scroll-mt-24 border-t md:pt-4 pt-3"
            >
              <h3 className="text-base sm:text-lg font-bold mb-1.5 dark:text-zinc-400 text-zinc-800">
                Features & Amenities
              </h3>
              {content.amenities}
            </section>
          </main>
        </div>

        <section
          id="rooms"
          className="scroll-mt-24 border-t md:pt-16 pt-6 md:mb-16 mb-5 w-full"
        >
          <div className="mb-8 text-left">
            <h3 className="text-2xl font-bold">Available Tours</h3>
            <p className="text-slate-500 text-sm">Choose the best tour</p>
          </div>
          <SliderIfNotChooseDate handleClick={handleClick}>
            {content.rooms}
          </SliderIfNotChooseDate>
        </section>

        <section
          id="reviews"
          className="scroll-mt-24 py-5 border-t md:pt-5 pt-6 md:mb-6 mb-5"
        >
          {content.reviews}
        </section>

        <section
          id="policies"
          className="scroll-mt-24 border-t md:pt-6 pt-4 mb-8"
        >
          <Policies id={companyId} />
        </section>
      </div>
    </div>
  );
}
