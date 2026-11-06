"use client";

import { useSearchCity, type PlaceResult } from "@/hooks/useSearch";
import { Input } from "@base-ui/react";
import {
  Loader2,
  LucideIcon,
  MapPin,
  Building2,
  Mountain,
  Landmark,
  Navigation,
  Hotel,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Type → Icon & Badge mapping ───────────────────────────────────────────

const TYPE_META: Record<
  string,
  { icon: LucideIcon; badge: string; color: string }
> = {
  city: {
    icon: Building2,
    badge: "City",
    color: "text-blue-500 bg-blue-500/10",
  },
  town: {
    icon: Mountain,
    badge: "Town",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  village: {
    icon: Mountain,
    badge: "Village",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  hamlet: {
    icon: Mountain,
    badge: "Area",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  district: {
    icon: Landmark,
    badge: "District",
    color: "text-amber-500 bg-amber-500/10",
  },
  landmark: {
    icon: Navigation,
    badge: "Landmark",
    color: "text-purple-500 bg-purple-500/10",
  },
  hotel: {
    icon: Hotel,
    badge: "Property",
    color: "text-rose-500 bg-rose-500/10",
  },
  suburb: {
    icon: Building2,
    badge: "Area",
    color: "text-teal-500 bg-teal-500/10",
  },
  locality: {
    icon: MapPin,
    badge: "Locality",
    color: "text-teal-500 bg-teal-500/10",
  },
  municipality: {
    icon: Building2,
    badge: "City",
    color: "text-blue-500 bg-blue-500/10",
  },
  neighbourhood: {
    icon: MapPin,
    badge: "Area",
    color: "text-teal-500 bg-teal-500/10",
  },
  place: {
    icon: MapPin,
    badge: "Place",
    color: "text-zinc-500 bg-zinc-500/10",
  },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META["place"];
}

// ─── Address Search (Dropdown) ──────────────────────────────────────────────

const AddressSearch = ({
  label,
  placeholder,
  className,
  setCity,
  value,
}: {
  label: string;
  placeholder: string;
  className?: string;
  setCity: (city: string) => void;
  value?: string;
}) => {
  const [query, setQuery] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading } = useSearchCity(query);
  const searchRef = useRef<HTMLDivElement>(null);

  const previousValue = useRef(value);
  useEffect(() => {
    if (value !== previousValue.current) {
      previousValue.current = value;
      setQuery(value ?? "");
    }
  }, [value]);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setCity(place.name);
    setIsOpen(false);
  };

  // Split results into DB and geo groups
  const dbResults = results.filter((r) => r.source === "db");
  const geoResults = results.filter((r) => r.source === "geo");
  const hasResults = results.length > 0;

  return (
    <div
      className={cn("w-full max-w-full", className)}
      ref={searchRef}
    >
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-50">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-7.5 md:h-11 w-full rounded-xl border-none px-1.5 outline-none bg-transparent text-xs sm:text-sm md:text-base font-semibold text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 bg-white dark:bg-zinc-900 p-2 rounded-2xl absolute z-[999] left-0 right-0 w-full md:w-[420px] md:right-auto shadow-2xl border border-gray-200 dark:border-zinc-700 max-h-[260px] sm:max-h-[290px] overflow-y-auto scrollbar-thin opacity-100"
          >
            {/* DB Results — real properties */}
            {dbResults.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-1 pb-2">
                  Properties & Locations
                </p>
                {dbResults.map((place) => (
                  <SuggestionItem
                    key={place.id}
                    place={place}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {/* Geo Results — from Photon/Nominatim */}
            {geoResults.length > 0 && (
              <div>
                {dbResults.length > 0 && (
                  <div className="border-t border-border/50 my-1" />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-1 pb-2">
                  Explore Destinations
                </p>
                {geoResults.map((place) => (
                  <SuggestionItem
                    key={place.id}
                    place={place}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Single suggestion row ──────────────────────────────────────────────────

function SuggestionItem({
  place,
  onSelect,
}: {
  place: PlaceResult;
  onSelect: (p: PlaceResult) => void;
}) {
  const meta = getMeta(place.type);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2.5 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors group"
      onClick={() => onSelect(place)}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
          meta.color,
        )}
      >
        <Icon size={16} />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate">
          {place.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {place.label}
        </p>
      </div>

      <span
        className={cn(
          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 hidden sm:block",
          meta.color,
        )}
      >
        {meta.badge}
      </span>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

const SearchInput = ({
  label,
  placeholder,
  Icon,
  className,
  setCity,
  value,
}: {
  label: string;
  placeholder: string;
  Icon?: LucideIcon;
  setCity: (city: string) => void;
  className?: string;
  value?: string;
}) => {
  return (
    <div
      className={cn(
        "relative z-50 flex items-center justify-between bg-[#ebf2ee] dark:bg-zinc-800/90 rounded-xl px-2.5 sm:px-4 py-0.5 sm:py-1.5 border border-transparent hover:border-emerald-700/20 transition-colors w-full",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon ? (
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
        ) : (
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
        )}
        <AddressSearch
          label={label}
          placeholder={placeholder}
          setCity={setCity}
          value={value}
        />
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 md:hidden ml-1" />
    </div>
  );
};

export default SearchInput;
