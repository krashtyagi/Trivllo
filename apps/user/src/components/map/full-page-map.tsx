"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHotelContext } from "@/context/hotel/HotelContextProvider";
import { useHotelStore } from "@/store/hotel.store";
import { getNearbyHotels } from "@/services/hotel/hotel.service";
import MapLeaf, { MapHotelItem } from "./leaf-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Loader2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export const FullPageMapView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hotels: destinationHotels, isLoading } = useHotelContext();
  const { city, setCity } = useHotelStore();

  const [mode, setMode] = useState<"destination" | "nearby">("destination");
  const [selectedRadius, setSelectedRadius] = useState<number>(2000); // 2 km
  const [showRadius, setShowRadius] = useState(true);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [nearbyHotels, setNearbyHotels] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const activeHotels: MapHotelItem[] =
    mode === "nearby" ? nearbyHotels : destinationHotels;

  // Set default selected hotel if none
  useEffect(() => {
    if (activeHotels.length > 0 && !selectedHotelId) {
      const firstId = activeHotels[0]._id || (activeHotels[0] as any).id || "0";
      setSelectedHotelId(firstId);
    }
  }, [activeHotels, selectedHotelId]);

  // Handle returning to standard list/filter view
  const handleBackToList = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("map-open");
    const qs = params.toString();
    router.push(`/hotels/find${qs ? `?${qs}` : ""}`);
  };

  // Nearby Geolocation Handler
  const handleFetchNearby = useCallback(
    async (radius = selectedRadius) => {
      setIsLocating(true);
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          try {
            const res = await getNearbyHotels(lat, lng, radius, 50);
            if (res?.success && Array.isArray(res.data)) {
              setNearbyHotels(res.data);
              setMode("nearby");
              setShowRadius(true);
              if (res.data.length > 0) {
                const firstId = res.data[0]._id || res.data[0].id || "0";
                setSelectedHotelId(firstId);
                toast.success(
                  `Found ${res.count} stays within ${radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}!`,
                );
              } else {
                toast.info(`No hotels registered within ${radius / 1000} km.`);
              }
            } else {
              toast.info(`No hotels found within ${radius / 1000} km.`);
            }
          } catch {
            toast.error("Failed to query nearby hotels.");
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Please enable location permissions to search nearby.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    },
    [selectedRadius],
  );

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-zinc-900 relative overflow-hidden select-none">
      {/* Top Controls Toolbar - exact match with top navbar colors */}
      <div className="px-3 sm:px-6 py-2.5 bg-white dark:bg-zinc-900 border-b border-gray-200/80 dark:border-gray-800 z-20 flex flex-wrap items-center justify-between gap-2.5 shrink-0 shadow-xs">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToList}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to List</span>
            <span className="sm:hidden">List</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight flex items-center gap-1.5">
                <span>
                  {mode === "nearby" ? "Near Your Location" : `Stays in ${city || "Destination"}`}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {isLoading ? "..." : `${activeHotels.length} stays`}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Mode Switchers (City vs Near Me) & Radius */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => {
                setMode("destination");
                if (destinationHotels.length > 0) {
                  const firstId =
                    destinationHotels[0]._id ||
                    (destinationHotels[0] as any).id ||
                    "0";
                  setSelectedHotelId(firstId);
                }
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all text-xs",
                mode === "destination"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
              )}
            >
              City ({destinationHotels.length})
            </button>

            <button
              type="button"
              onClick={() => {
                if (userCoords) {
                  setMode("nearby");
                  if (nearbyHotels.length > 0) {
                    const firstId = nearbyHotels[0]._id || nearbyHotels[0].id || "0";
                    setSelectedHotelId(firstId);
                  }
                } else {
                  handleFetchNearby(selectedRadius);
                }
              }}
              disabled={isLocating}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 text-xs",
                mode === "nearby"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
              )}
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              <span>Near Me ({nearbyHotels.length})</span>
            </button>
          </div>

          {/* Radius selector if nearby mode */}
          {mode === "nearby" && (
            <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px]">
              {[1000, 2000, 5000].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRadius(r);
                    handleFetchNearby(r);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-medium transition-all",
                    selectedRadius === r
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                  )}
                >
                  {r / 1000} km
                </button>
              ))}
            </div>
          )}

          {/* Radius ON/OFF Toggle */}
          <button
            type="button"
            onClick={() => setShowRadius((prev) => !prev)}
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
              showRadius
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600 shadow-xs"
                : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-700",
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showRadius ? "Radius: ON" : "Radius: OFF"}</span>
          </button>
        </div>
      </div>

      {/* Full Page Map Canvas - NO floating cards at the bottom */}
      <div className="relative flex-1 w-full h-full">
        <MapLeaf
          height="100%"
          width="100%"
          hotels={activeHotels}
          userCoords={userCoords}
          selectedHotelId={selectedHotelId}
          onSelectHotel={(id) => setSelectedHotelId(id)}
          interactive={true}
          fitAllHotels={true}
          showRouting={false}
          showRadius={showRadius && mode === "nearby"}
          radiusMeters={selectedRadius}
          zoom={mode === "nearby" ? 14 : 12}
          cooperativeGestures={false}
        />
      </div>
    </div>
  );
};
