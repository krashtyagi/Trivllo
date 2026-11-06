"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { IconGrid4x4, IconMenu4 } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
// import { SheetNavigation } from "./sheetNavigation";
import { ChevronRight } from "lucide-react";
import { useNuqsContext } from "@/context/NuqsContentProvider";
import { Tour, useTourContext } from "@/context/TourContextProvider";
import { ToursCard, ToursCardSkeleton } from "./CardCompo";
import { useToursStore } from "@/store/tours.store";
import { ScrollToTopByParams } from "@/components/ui/ScrollToTopByParams";
import { Pagination_console } from "@/components/ui/pagination-console";
import SwitchGrids from "@/components/side-bar-filter/SwitchGrid";
import { SideBarFilter } from "@/components/filter-bar/sidebar-filter";
import { SheetNavigation } from "@/components/ui/sheetNavigation";
import { tourItems } from "@/constants/filter-constants";

type Props = {};

export const ContentFrame = (props: Props) => {
  const ismobile = useIsMobile()
  const { total, isLoading, page, setPage } = useTourContext()
  const { city: city } = useToursStore();
  const [open, setOpen] = useState(false)
  return (
    <div className="md:w-full">
      <div className="flex justify-between px-4 sm:px-0">
        <div className="flex gap-3 w-full">
          {<div className="block xl:hidden h-10    ">
            <SheetNavigation
              content={
                <SideBarFilter items={tourItems} mapSrc="/map-icons/map.png" alt="map image" overlayTitle="See Location on Map" />
              }
              setOpen={setOpen}
              trigger={
                <Button variant={"ghost"} className="border-r">
                  {<ChevronRight className="h-4 w-4" />}
                </Button>
              }
            />
          </div>}
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 ">
              {total > 0 ? `Explore ${total}+ Tours in ${city}` : `Explore tours in ${city}`}
            </h2>
            {/* <div className="w-10 min-w-37 md:w-1/2 mb-6">

            <ComboboxMultiple />
          </div> */}
          </div>
        </div>
        <div>
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
  const { wrap } = useNuqsContext();
  const isMobile = useIsMobile()
  const { tours, isLoading } = useTourContext()


  if (isLoading) {
    return (
      <>
        <ScrollToTopByParams />
        <div
          className={cn(
            "grid px-2 gap-y-8",
            (wrap || isMobile)
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 justify-items-center"
              : "grid-cols-1",
            className
          )}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full">
              <ToursCardSkeleton wrap={wrap} />
            </div>
          ))}
        </div>
      </>
    )
  }

  if (!isLoading && tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <p className="text-lg">No tours found for the selected filters.</p>
        <p className="text-sm">Try adjusting or clearing the filters.</p>
      </div>
    )
  }

  return (<>

    <ScrollToTopByParams />
    <div
      className={cn(
        "grid px-2  gap-y-8",
        (wrap || isMobile)
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 justify-items-center"
          : "grid-cols-1",
        className
      )}
    >
      {tours?.map((tour: Tour) => (
        <ToursCard
          key={tour.serviceId}
          tour={tour}
          wrap={wrap || isMobile}
        />
      ))}
    </div>
  </>
  );
};


