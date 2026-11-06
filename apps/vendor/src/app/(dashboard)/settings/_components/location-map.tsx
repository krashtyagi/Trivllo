"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin, X, Navigation } from "lucide-react";
import { toast } from "sonner";

// Custom Leaflet marker icon
const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Pre-seeded Indian tourism & major cities coordinates for instant offline fallback
const POPULAR_INDIAN_CITIES: Record<string, [number, number]> = {
  manali: [32.2432, 77.1892],
  shimla: [31.1048, 77.1734],
  srinagar: [34.0837, 74.7973],
  goa: [15.2993, 74.124],
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.7125],
  rishikesh: [30.0869, 78.2676],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  bengaluru: [12.9716, 77.5946],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  agra: [27.1767, 78.0081],
  varanasi: [25.3176, 82.9739],
  amritsar: [31.634, 74.8723],
  darjeeling: [27.041, 88.2663],
  munnar: [10.0889, 77.0595],
  indore: [22.7196, 75.8577],
  chandigarh: [30.7333, 76.7794],
  dharamshala: [32.219, 76.3234],
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [center, map]);

  return null;
}

function MapClickHandler({ onChange }: { onChange: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface LocationMapProps {
  center: [number, number]; // [lat, lng]
  onChange: (coords: [number, number]) => void;
}

export default function LocationMap({ center, onChange }: LocationMapProps) {
  // Ensure valid fallback coordinates (e.g. New Delhi: 28.6139, 77.2090) if 0,0 or null
  const validCenter: [number, number] =
    center && !isNaN(center[0]) && !isNaN(center[1]) && center[0] !== 0
      ? center
      : [28.6139, 77.209];

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ displayName: string; lat: number; lng: number }>
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (lat: number, lng: number, label: string) => {
    onChange([lat, lng]);
    setSearchQuery(label);
    setShowDropdown(false);
    toast.success(`Map centered to ${label}`);
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const normalized = query.toLowerCase();
    // 1. Instant check in our top Indian tourist cities map
    const quickCoords = POPULAR_INDIAN_CITIES[normalized];
    if (quickCoords) {
      handleSelectLocation(quickCoords[0], quickCoords[1], query);
      return;
    }

    // 2. OpenStreetMap Nominatim Geocoding
    setIsSearching(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=in&limit=5`;
      const res = await fetch(endpoint, {
        headers: {
          "Accept-Language": "en",
        },
      });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          // If multiple results, show dropdown so vendor can pick exact area
          if (data.length > 1) {
            setSuggestions(
              data.map((item: any) => ({
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              }))
            );
            setShowDropdown(true);
          }
          handleSelectLocation(lat, lng, first.display_name.split(",")[0] || query);
        }
      } else {
        toast.error(`Could not locate "${query}". Try searching a nearby landmark or district.`);
      }
    } catch {
      toast.error("City search network error. Please try again or drag the pin manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const quickPillCities = ["Manali", "Shimla", "Srinagar", "Goa", "Jaipur", "Rishikesh", "Delhi"];

  return (
    <div className="space-y-2">
      {/* ── Search Input & Quick Navigation Toolbar ── */}
      <div className="relative z-30" ref={dropdownRef}>
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setShowDropdown(false);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              placeholder="Search city, district, or area (e.g. Shimla, Sanjauli, Manali, Dal Lake)..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-background border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5" />
            )}
            <span>Locate City</span>
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-popover/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLocation(item.lat, item.lng, item.displayName.split(",")[0])}
                className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-muted/80 flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground line-clamp-1">{item.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Click City Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 pb-0.5">
          <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            Quick Pan:
          </span>
          {quickPillCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                const coords = POPULAR_INDIAN_CITIES[city.toLowerCase()];
                if (coords) handleSelectLocation(coords[0], coords[1], city);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-muted-foreground border border-border/60 transition-colors shrink-0 cursor-pointer"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* ── Leaflet Interactive Map Canvas ── */}
      <div className="h-[340px] w-full rounded-2xl overflow-hidden border border-border shadow-sm relative z-0">
        <MapContainer
          center={validCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={validCenter} />
          <MapClickHandler onChange={onChange} />
          <Marker
            position={validCenter}
            icon={customMarkerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                onChange([pos.lat, pos.lng]);
              },
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
