"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getDestinationSuggestions,
  type DestinationSuggestion,
} from "@/services/hotel/hotel.service";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlaceResult {
  id: string;
  name: string;
  label: string;
  lat?: number;
  lon?: number;
  type: string; // city | town | village | hotel | district | landmark …
  source: "db" | "geo"; // where the result came from
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export const INDIA_BBOX = "68.1,6.5,97.5,35.7";

const PLACE_TYPES = [
  "city",
  "town",
  "village",
  "hamlet",
  "suburb",
  "locality",
  "municipality",
  "neighbourhood",
];

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Photon (external geocoder) ─────────────────────────────────────────────

function photonUrl(
  q: string,
  opts: { filtered: boolean; bbox?: string },
) {
  const params = new URLSearchParams({ q, limit: "8" });
  if (opts.bbox) params.set("bbox", opts.bbox);
  if (opts.filtered) {
    PLACE_TYPES.forEach((type) => params.append("osm_tag", `place:${type}`));
  }
  return `https://photon.komoot.io/api/?${params.toString()}`;
}

function fromPhoton(features: any[]): PlaceResult[] {
  return features
    .filter((f) => f?.properties?.osm_key === "place")
    .map((f): PlaceResult | null => {
      const p = f.properties;
      const coords = f.geometry?.coordinates;
      if (!p || !Array.isArray(coords) || coords.length < 2) return null;

      const [lon, lat] = coords;
      const name = p.name ?? "";
      const label = [name, p.district ?? p.county, p.state, p.country]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ");

      return {
        id: `${p.osm_type}${p.osm_id}`,
        name,
        label,
        lat: Number(lat),
        lon: Number(lon),
        type: p.osm_value ?? "place",
        source: "geo" as const,
      };
    })
    .filter((p): p is PlaceResult => p !== null);
}

async function searchPhoton(
  q: string,
  signal: AbortSignal,
  opts: { filtered: boolean; bbox?: string },
): Promise<PlaceResult[]> {
  const res = await fetch(photonUrl(q, opts), { signal });
  if (!res.ok) throw new Error(`Photon error ${res.status}`);
  const json = await res.json();
  return fromPhoton(json.features ?? []);
}

// ─── Nominatim (fallback geocoder) ──────────────────────────────────────────

async function searchNominatim(
  q: string,
  signal: AbortSignal,
  countryCodes?: string,
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "8",
  });
  if (countryCodes) params.set("countrycodes", countryCodes);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal },
  );
  if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
  const json: any[] = await res.json();

  return json
    .map((r): PlaceResult | null => {
      if (!r) return null;
      const name = r.name || r.display_name?.split(",")[0] || "";
      return {
        id: `nominatim-${r.place_id}`,
        name,
        label: r.display_name || name,
        lat: Number(r.lat),
        lon: Number(r.lon),
        type: r.addresstype ?? r.type ?? "place",
        source: "geo" as const,
      };
    })
    .filter((p): p is PlaceResult => p !== null);
}

// ─── Backend DB suggestions ─────────────────────────────────────────────────

function dbToPlaceResults(suggestions: DestinationSuggestion[]): PlaceResult[] {
  return suggestions.map((s, i) => ({
    id: s.id || `db-${s.type}-${i}`,
    name: s.value,
    label: s.label,
    type: s.type,
    source: "db" as const,
  }));
}

// ─── Main Hook ──────────────────────────────────────────────────────────────

interface Options {
  bbox?: string;
  countryCodes?: string;
}

export const useSearchCity = (query: string, options: Options = {}) => {
  const { bbox, countryCodes } = options;
  const debouncedQuery = useDebounce(query.trim(), 400);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search_city_merged", debouncedQuery, bbox, countryCodes],
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,

    queryFn: async ({ signal }) => {
      // Fire both DB and geo searches in parallel
      const [dbResults, geoResults] = await Promise.allSettled([
        getDestinationSuggestions(debouncedQuery),
        searchPhoton(debouncedQuery, signal, {
          filtered: true,
          bbox: bbox || INDIA_BBOX,
        }),
      ]);

      const dbPlaces =
        dbResults.status === "fulfilled"
          ? dbToPlaceResults(dbResults.value)
          : [];

      let geoPlaces =
        geoResults.status === "fulfilled" ? geoResults.value : [];

      // If Photon returned nothing, try without filter, then Nominatim
      if (geoPlaces.length === 0) {
        try {
          geoPlaces = await searchPhoton(debouncedQuery, signal, {
            filtered: false,
            bbox,
          });
        } catch {
          // ignore
        }
      }
      if (geoPlaces.length === 0) {
        try {
          geoPlaces = await searchNominatim(
            debouncedQuery,
            signal,
            countryCodes || "in",
          );
        } catch {
          // ignore
        }
      }

      // Merge: DB results first (these are real properties), then geo
      // Deduplicate by lowercase name
      const seen = new Set<string>();
      const merged: PlaceResult[] = [];

      for (const place of [...dbPlaces, ...geoPlaces]) {
        const key = place.name.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(place);
      }

      return merged.slice(0, 8);
    },
  });

  return {
    results: data ?? [],
    loading: isLoading,
    error,
  };
};
