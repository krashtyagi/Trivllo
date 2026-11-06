"use client";
import React, { useState, useContext, useCallback } from "react";
import dynamic from "next/dynamic";
import { AcordionItemType } from "@/constants/filter-constants";
import { cn } from "@/lib/utils";
import { HotelContext } from "@/context/hotel/HotelContextProvider";
import { MapPin, Compass, SlidersHorizontal, Sparkles } from "lucide-react";
// Dynamically import MapLeaf with SSR disabled
const MapLeaf = dynamic(() => import("@/components/map/leaf-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[160px] rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <MapPin className="w-4 h-4 text-emerald-500 animate-bounce" />
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

import { useRouter, useSearchParams } from "next/navigation";

export const SideBarFilter = ({
  mapSrc,
  alt = "map preview",
  items,
  overlayTitle = "See Location on Map",
  className,
}: {
  mapSrc?: string;
  alt?: string;
  overlayTitle?: string;
  className?: string;
  items: AcordionItemType[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelCtx = useContext(HotelContext);
  const destinationHotels = hotelCtx?.hotels || [];

  const handleOpenFullMap = (mode?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("map-open", "true");
    if (mode) {
      params.set("mode", mode);
    }
    router.push(`/hotels/find?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 p-1 xl:min-w-[270px] w-full">
      <div className="relative group">
        <div
          onClick={() => handleOpenFullMap()}
          className={cn(
            "relative w-full h-40 rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-zinc-100 dark:bg-zinc-800",
            className,
          )}
        >
          {/* Live Leaflet Map Preview */}
          <div className="absolute inset-0 w-full h-full pointer-events-none brightness-90 contrast-[1.05] transition-transform duration-500 group-hover:scale-105">
            <MapLeaf
              height="100%"
              width="100%"
              hotels={destinationHotels}
              interactive={false}
              zoom={12}
            />
          </div>

          {/* Gradient Mask & Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/55 transition-colors duration-300 backdrop-blur-[1px] p-3 text-center">
            <span className="flex items-center gap-1.5 text-white text-xs sm:text-sm font-semibold tracking-wide px-4 py-2 rounded-full bg-black/50 backdrop-blur-md shadow-xl group-hover:bg-zinc-900 group-hover:scale-105 transition-all">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{overlayTitle}</span>
            </span>

            <span className="font-cursive text-sm text-white/95 font-medium mt-1.5 opacity-90 transition-opacity">
              Explore on live map
            </span>
          </div>
        </div>

        {/* Quick Action Button - Smooth Gradient Pill, No Border */}
        <button
          type="button"
          onClick={() => handleOpenFullMap()}
          className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#0c3926] to-emerald-800 hover:from-[#08291b] hover:to-emerald-900 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-300" />
          <span>Explore Stays on Full Map</span>
        </button>
      </div>

      <FilterAccordion items={items} />
      <div className="w-full h-[50px]"></div>
    </div>
  );
};

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNuqsContext } from "@/context/NuqsContentProvider";

export function FilterAccordion({ items }: { items: AcordionItemType[] }) {
  const { setFilters } = useNuqsContext();
  const [openValues, setOpenValues] = React.useState<string[]>([]);

  const handleClear = () => {
    setFilters({
      price: null,
      typeOfPlace: null,
      Bedrooms: null,
      Beds: null,
      Bathrooms: null,
      roomSize: null,
      distance: null,
      amenities: null,
      essentials: null,
      features: null,
      onsite: null,
      roomsbeds: null,
      location: null,
      classification: null,
      score: null,
    } as any);
    setOpenValues([]);
  };

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] p-2.5 space-y-1.5">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-2xl mb-1.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0c3926] dark:text-emerald-400" />
          <span className="font-cursive text-lg font-bold text-foreground">Filter by</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <Accordion
        type="multiple"
        value={openValues}
        onValueChange={setOpenValues}
        className="space-y-1"
      >
        {items.map((item) => (
          <AccordionItem
            value={item.value}
            key={item.value}
            className="border-none bg-slate-50/40 dark:bg-zinc-800/30 hover:bg-slate-50/80 dark:hover:bg-zinc-800/60 rounded-2xl mb-1 transition-colors overflow-hidden"
          >
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline font-semibold text-xs text-foreground [&[data-state=open]]:text-[#0c3926] dark:[&[data-state=open]]:text-emerald-400 border-none">
              {item.trigger}
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pb-3 pt-1 border-none">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
