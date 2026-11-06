"use client";
import React, { useState } from "react";
import { HotelCard, HotelCardSkeleton } from "./CardCompo";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { IconGrid4x4, IconMenu4 } from "@tabler/icons-react";
import { useHotelStore } from "@/store/hotel.store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHotelContext } from "@/context/hotel/HotelContextProvider";
import { Hotel } from "@/types";
// import { SheetNavigation } from "./sheetNavigation";

import {
  ChevronRight,
  Map,
  SlidersHorizontal,
  Sparkles,
  Compass,
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScrollToTopByParams } from "@/components/ui/ScrollToTopByParams";
import { Pagination_console } from "@/components/ui/pagination-console";
import SwitchGrids from "@/components/side-bar-filter/SwitchGrid";
import { useNuqsContext } from "@/context/NuqsContentProvider";
import { SideBarFilter } from "@/components/filter-bar/sidebar-filter";
import { SheetNavigation } from "@/components/ui/sheetNavigation";
import { hotelItems } from "@/constants/filter-constants";

type Props = {};

export const ContentFrame = (props: Props) => {
  const ismobile = useIsMobile();
  const { total, isLoading, page, setPage } = useHotelContext();
  const { city, setCity } = useHotelStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="md:w-full">
      {/* Header Bar - Smooth Shades, No Borders, Cursive Accents */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-0 mb-6">
        <div className="flex items-center gap-3 w-full">
          {/* Mobile Filter Sheet Trigger - Smooth Pill, No Border */}
          <div className="block xl:hidden shrink-0">
            <SheetNavigation
              content={
                <SideBarFilter
                  items={hotelItems}
                  mapSrc="/map-icons/map.png"
                  alt="map image"
                  overlayTitle="See Location on Map"
                />
              }
              setOpen={setOpen}
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100/90 dark:bg-zinc-800/90 hover:bg-slate-200/90 dark:hover:bg-zinc-700/90 text-foreground text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                  aria-label="Open Filters"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#0c3926] dark:text-emerald-400" />
                  <span>Filters</span>
                </button>
              }
            />
          </div>

          <div className="w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-sm text-[11px] font-medium mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="font-cursive text-sm">Handcrafted stays</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              <span>Explore hotels in </span>
              <span className="font-cursive text-2xl sm:text-3xl md:text-4xl text-[#0c3926] dark:text-emerald-400 capitalize">
                {searchParams.get("city") || city || "India"}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls - Smooth Shades, No Borders */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("map-open", "true");
              router.push(`/hotels/find?${params.toString()}`);
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-full bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 shadow-sm text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Show map</span>
          </button>
          {!ismobile && <SwitchGrids />}
        </div>
      </div>

      <Content className={cn("gap-x-4 gap-y-6")} />
      <div className="flex py-8">
        <Pagination_console {...{ page, isLoading, setPage, total }} />
      </div>
    </div>
  );
};

export const Content = ({ className }: { className: string }) => {
  const { city } = useHotelStore();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { hotels, isLoading } = useHotelContext();
  const { wrap } = useNuqsContext();
  const router = useRouter();

  if (isLoading) {
    return (
      <>
        <ScrollToTopByParams />
        <div
          className={cn(
            "grid px-2 gap-y-8",
            wrap || isMobile
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 justify-items-center"
              : "grid-cols-1",
            className,
          )}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full">
              <HotelCardSkeleton wrap={wrap} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!isLoading && hotels.length === 0) {
    return (
      <div className="w-full py-12 px-4 flex justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-4 shadow-sm">
            <Compass className="w-7 h-7" />
          </div>

          <span className="font-cursive text-2xl text-emerald-800 dark:text-emerald-400 font-semibold mb-1">
            Discoveries Await
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            No hotels found in{" "}
            <span className="capitalize">{searchParams.get("city") || city || "this destination"}</span>
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs font-normal">
            We couldn&apos;t find matching stays for the chosen filters. Try
            resetting filters or choosing broader dates to uncover cozy escapes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6 w-full max-w-xs">
            {/* <button
              type="button"
              onClick={() => {
                window.location.href = "/hotels/find";
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#0c3926] hover:bg-[#08291b] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button> */}
            <button
              type="button"
              onClick={() => {
                router.push("/hotels");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore All Stays</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTopByParams />
      <div
        className={cn(
          "grid px-2  gap-y-8",
          wrap || isMobile
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 justify-items-center"
            : "grid-cols-1",
          className,
        )}
      >
        {hotels.map((hotel: Hotel) => {
          const roomTypes = (hotel as any).roomTypes ?? [];
          const lowestPrice =
            roomTypes.length > 0
              ? Math.min(
                  ...roomTypes.map((r: any) =>
                    r.discountPrice > 0 ? r.discountPrice : r.basePrice,
                  ),
                )
              : ((hotel as any).startingPrice ?? 0);

          const firstImage =
            hotel.thumbnail &&
            typeof hotel.thumbnail === "string" &&
            hotel.thumbnail.length > 0
              ? hotel.thumbnail
              : (hotel as any).hotelImages?.[0]?.url ||
                (typeof hotel.images?.[0] === "string" ? hotel.images[0] : (hotel.images?.[0] as any)?.url) ||
                "/hotels/hotel-temp.png";

          return (
            <HotelCard
              key={hotel._id}
              hotelId={hotel._id}
              image={firstImage}
              hotelImages={(hotel as any).hotelImages ?? hotel.images ?? []}
              favourite={hotel.isFavorite}
              title={hotel.name}
              location={hotel.city ?? city}
              rating={hotel.rating ?? 0}
              stars={Math.round(hotel.rating ?? 0)}
              reviews={{
                text:
                  (hotel.rating ?? 0) >= 4.5
                    ? "Excellent"
                    : (hotel.rating ?? 0) >= 3.5
                      ? "Very Good"
                      : (hotel.rating ?? 0) >= 2.5
                        ? "Good"
                        : "",
                count: hotel.numReviews ?? 0,
              }}
              roomInfo={hotel.description ?? ""}
              price={lowestPrice ? `₹${lowestPrice.toLocaleString()}` : "—"}
              discount={""}
              wrap={wrap || isMobile}
              amenities={hotel.amenities ?? []}
            />
          );
        })}
      </div>
    </>
  );
};
