import HotelFilterBar from "@/components/filter-bar/HotelFilterBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import dynamic from "next/dynamic";
import React, { Suspense, useState } from "react";
const MapLeaf = dynamic(() => import("@/components/map/leaf-map"), {
  ssr: false,
});
import { formatAddress } from "@/lib/utils";

export type LocationProps = {
  address: unknown;
  map: string;
  cordinates?: [number, number];
};
// import customIconUrl from '/map-marker.png'
// MapLocation.tsx

const MapLocation = ({ address, cordinates }: LocationProps) => {
  const [showRouting, setShowRouting] = useState(false);

  return (
    <Card className="w-full bg-transparent border-none shadow-none p-0">
      <CardHeader className="px-0">
        <h3 className="text-xl font-bold dark:text-zinc-400 text-zinc-800">
          Location
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatAddress(address)}
        </p>
      </CardHeader>
      <CardContent className="p-0 -mx-2 sm:mx-0">
        <div className="overflow-hidden rounded-md sm:rounded-2xl w-full relative group">
          <div className="w-full aspect-video md:aspect-auto md:h-[400px] relative z-0">
            <Suspense
              fallback={
                <div className="h-full w-full bg-muted animate-pulse" />
              }
            >
              <MapLeaf
                cordinates={cordinates}
                height="100%"
                showRouting={showRouting}
              />
            </Suspense>
          </div>
          <div className="absolute  top-4 right-4 flex flex-col gap-2 items-end">
            <HotelFilterBar
              renderContent={(isOpen) =>
                isOpen ? (
                  <div className="relative w-full h-full">
                    <MapLeaf
                      cordinates={cordinates}
                      className="w-full"
                      height="100%"
                      width="100%"
                      showRouting={showRouting}
                      cooperativeGestures={false}
                    />

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-[1000]">
                      <button
                        onClick={() => setShowRouting(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-xl border border-primary hover:scale-105 transition-transform whitespace-nowrap"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-route"
                        >
                          <circle cx="6" cy="19" r="3" />
                          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                          <circle cx="18" cy="5" r="3" />
                        </svg>
                        <span>Get Route</span>
                      </button>
                    </div>
                  </div>
                ) : null
              }
            >
              <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-full font-medium shadow-sm border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-navigation"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span className="md:block hidden">Show map</span>
              </button>
            </HotelFilterBar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocation;
