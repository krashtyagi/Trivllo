"use client";

import { useSearchCity, type PlaceResult } from "@/hooks/useSearch";
import { Input } from "@base-ui/react";
import {
  MapPin,
  Loader2,
  Building2,
  Palmtree,
  Mountain,
  Landmark,
  Ship,
  Tent,
  Hotel,
  Navigation,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useHotelStore } from "@/store/hotel.store";
import { useToursStore } from "@/store/tours.store";
import { useAdventureStore } from "@/store/adventure.store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SUGGESTED_CITIES = [
  { name: "Mumbai", subtitle: "Maharashtra, India", icon: Building2 },
  { name: "New Delhi", subtitle: "Delhi, India", icon: Landmark },
  { name: "Bengaluru", subtitle: "Karnataka, India", icon: Building2 },
  { name: "Goa", subtitle: "India", icon: Palmtree },
  { name: "Jaipur", subtitle: "Rajasthan, India", icon: Tent },
  { name: "Udaipur", subtitle: "Rajasthan, India", icon: Mountain },
];

const TYPE_ICON: Record<string, React.ComponentType<any>> = {
  city: Building2,
  town: Mountain,
  village: Mountain,
  district: Landmark,
  landmark: Navigation,
  hotel: Hotel,
};

export function NavSearchDestination() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelStore = useHotelStore();
  const toursStore = useToursStore();
  const adventureStore = useAdventureStore();

  const activeCategory = (() => {
    if (pathname.includes("/tours")) return "tours";
    if (pathname.includes("/adventures")) return "adventures";
    return "hotels";
  })();

  const activeCity = (() => {
    if (activeCategory === "tours") return toursStore.city;
    if (activeCategory === "adventures") return adventureStore.city;
    return hotelStore.city;
  })();

  const handleSetCity = (city: string) => {
    const trimmed = city.trim();
    if (activeCategory === "tours") {
      toursStore.setCity(trimmed);
      if (pathname.includes("/tours/find")) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("city", trimmed.toLowerCase());
        router.replace(`/tours/find?${params.toString()}`);
      }
    } else if (activeCategory === "adventures") {
      adventureStore.setCity(trimmed);
    } else {
      hotelStore.setCity(trimmed);
      if (pathname.includes("/hotels/find")) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("city", trimmed.toLowerCase());
        router.replace(`/hotels/find?${params.toString()}`);
      }
    }
  };

  const [query, setQuery] = useState(activeCity || "");
  const { results, loading } = useSearchCity(query);

  useEffect(() => {
    if (activeCity && activeCity !== query) {
      setQuery(activeCity);
    }
  }, [activeCity]);

  const hasTyped = query.length > 0;

  const dbResults = results.filter((r) => r.source === "db");
  const geoResults = results.filter((r) => r.source === "geo");
  const showResults = hasTyped && results.length > 0;
  const showEmpty = hasTyped && results.length === 0 && !loading;

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    handleSetCity(place.name);
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="flex items-center gap-3 bg-secondary/40 border border-border/50 rounded-xl px-4 py-2.5">
        <MapPin className="w-5 h-5 text-primary shrink-0" />
        <Input
          placeholder="Search destinations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              handleSetCity(query.trim());
            }
          }}
          className="w-full bg-transparent border-none outline-none text-sm md:text-base font-medium placeholder:text-muted-foreground/60"
        />
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Results or Default Cities */}
      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-0.5 overflow-hidden"
          >
            {/* DB results */}
            {dbResults.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-1">
                  Properties & Locations
                </p>
                {dbResults.map((place, i) => {
                  const Icon =
                    TYPE_ICON[place.type] || MapPin;
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-3 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors"
                      onClick={() => handleSelect(place)}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="text-primary" size={18} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {place.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {place.label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}

            {/* Geo results */}
            {geoResults.length > 0 && (
              <>
                {dbResults.length > 0 && (
                  <div className="border-t border-border/30 my-2" />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-1">
                  Explore Destinations
                </p>
                {geoResults.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (dbResults.length + i) * 0.04 }}
                    className="flex items-center gap-4 p-3 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors"
                    onClick={() => handleSelect(place)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <MapPin className="text-primary" size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {place.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {place.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        ) : showEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 py-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              No destinations found
            </p>
          </motion.div>
        ) : !hasTyped ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5"
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
              Popular destinations
            </p>
            <div className="space-y-0.5">
              {SUGGESTED_CITIES.map((city, i) => {
                const CityIcon = city.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors group"
                    onClick={() => {
                      setQuery(city.name);
                      handleSetCity(city.name);
                    }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/80 border border-border/30 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                      <CityIcon
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                        size={20}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {city.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {city.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
