"use client";

import { cn } from "@/lib/utils";
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { PopularDestinationCarousel } from "../carousel/tabs-carousel";
import { useGetNewHotels } from "@/services/hotel/querys";
import type { Item } from "../carousel/onlyColursel";
import {
  hoteldata,
  HotelFramePageProps,
} from "@/app/(home)/(categories)/hotels/page";
import { MapPin, Loader2 } from "lucide-react";
import FrameColursals from "./frame_coloursals";
import RankedBanner from "../addimage/RankedBanner";

export type SectionConfig = {
  _id?: string;
  tagline: string;
  city: string;
  limit?: number;
  aliases?: string[];
  order?: number;
};

export type DestinationSectionWithItems = {
  section: SectionConfig;
  items: Item[];
};

// Known localities / sub-areas mapped to their parent city (fallback dictionary)
const LOCALITY_TO_CITY: Record<string, string> = {
  // Shimla
  sanjauli: "shimla",
  kufri: "shimla",
  mashobra: "shimla",
  "chotta shimla": "shimla",
  shoghi: "shimla",
  "summer hill": "shimla",
  dhalli: "shimla",
  jakhoo: "shimla",
  totu: "shimla",
  boileauganj: "shimla",
  kasumpti: "shimla",
  bhattakufer: "shimla",
  chakrayal: "shimla",
  "new shimla": "shimla",
  "lakkar bazar": "shimla",

  // Manali
  siyal: "manali",
  simsa: "manali",
  vashisht: "manali",
  solang: "manali",
  "solang valley": "manali",
  naggar: "manali",
  prini: "manali",
  aleo: "manali",
  "old manali": "manali",

  // Goa
  "south goa": "goa",
  "north goa": "goa",
  calangute: "goa",
  candolim: "goa",
  baga: "goa",
  anjuna: "goa",
  panaji: "goa",
  panjim: "goa",
  vasco: "goa",
  morjim: "goa",
  arambol: "goa",
  colva: "goa",
  benaulim: "goa",
  vagator: "goa",
  mapusa: "goa",
  margao: "goa",

  // Rishikesh
  tapovan: "rishikesh",
  shivpuri: "rishikesh",
  "laxman jhula": "rishikesh",
  "ram jhula": "rishikesh",

  // Srinagar
  "dal lake": "srinagar",
  "lal chowk": "srinagar",
  dalgate: "srinagar",
  nishat: "srinagar",
  shalimar: "srinagar",
  rajbagh: "srinagar",

  // Bengaluru
  bangalore: "bengaluru",
  whitefield: "bengaluru",
  koramangala: "bengaluru",
  indiranagar: "bengaluru",
  "electronic city": "bengaluru",

  // Mumbai
  "navi mumbai": "mumbai",
  thane: "mumbai",
  andheri: "mumbai",
  bandra: "mumbai",
  juhu: "mumbai",
  colaba: "mumbai",

  // Delhi
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  "south delhi": "delhi",
  dwarka: "delhi",
  rohini: "delhi",
};

// Fallback sections list in case backend sections are not yet populated
const DEFAULT_POPULAR_SECTIONS: SectionConfig[] = [
  {
    tagline: "Popular Stays in Manali",
    city: "Manali",
    aliases: ["Siyal", "Simsa", "Old Manali", "Solang", "Vashisht", "Aleo"],
  },
  {
    tagline: "Popular Stays in Shimla",
    city: "Shimla",
    aliases: ["Sanjauli", "Kufri", "Mashobra", "Chotta Shimla", "Bhattakufer"],
  },
  {
    tagline: "Popular Stays in Srinagar",
    city: "Srinagar",
    aliases: ["Dal Lake", "Lal Chowk", "Dalgate", "Nishat"],
  },
  { tagline: "Luxury in Indore", city: "Indore" },

  {
    tagline: "Popular Homes In South Goa",
    city: "Goa",
    aliases: ["South Goa", "North Goa", "Calangute", "Candolim", "Baga", "Anjuna", "Panaji"],
  },
  {
    tagline: "Best in Delhi",
    city: "Delhi",
    aliases: ["New Delhi", "Delhi NCR", "South Delhi", "Dwarka"],
  },
  {
    tagline: "Popular Stays In Bengaluru",
    city: "Bengaluru",
    aliases: ["Bangalore", "Whitefield", "Koramangala", "Indiranagar"],
  },
  {
    tagline: "Popular Homes In Rishikesh",
    city: "Rishikesh",
    aliases: ["Tapovan", "Laxman Jhula", "Ram Jhula", "Shivpuri"],
  },
  {
    tagline: "Luxury in Mumbai",
    city: "Mumbai",
    aliases: ["Navi Mumbai", "Thane", "Andheri", "Bandra", "Juhu", "Colaba"],
  },
  { tagline: "Stays in Gwalior", city: "Gwalior" },

  { tagline: "Villas & Resorts in Udaipur", city: "Udaipur" },
  { tagline: "Stays in Jaipur", city: "Jaipur" },
  {
    tagline: "Luxury Rentals in Lonavala",
    city: "Lonavala",
    aliases: ["Khandala"],
  },

  { tagline: "Heritage Homes in Mysore", city: "Mysore" },
  { tagline: "Coastal Villas in Kochi", city: "Kochi" },
  { tagline: "Hospitality Hub of Hyderabad", city: "Hyderabad" },
  { tagline: "Beachfront Stays in Pondicherry", city: "Pondicherry" },
  { tagline: "Villas in Alibaug", city: "Alibaug" },
];

const escapeRegex = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesText = (haystack: string, needle: string): boolean => {
  const h = haystack.toLowerCase().trim();
  const n = needle.toLowerCase().trim();
  if (!h || !n) return false;
  if (h === n) return true;

  const regex = new RegExp(`(?:^|[\\s,/-])${escapeRegex(n)}(?:$|[\\s,/-])`, "i");
  if (regex.test(h)) return true;

  const revRegex = new RegExp(`(?:^|[\\s,/-])${escapeRegex(h)}(?:$|[\\s,/-])`, "i");
  if (revRegex.test(n)) return true;

  return false;
};

const matchesSectionCity = (
  hotel: hoteldata,
  section: SectionConfig,
): boolean => {
  const targetCity = section.city.toLowerCase().trim();
  const aliases = (section.aliases || []).map((a) => a.toLowerCase().trim());

  const locationStrings: string[] = [
    hotel.city,
    (hotel as any).address?.city,
    (hotel as any).address?.areaName,
    (hotel as any).address?.district,
    (hotel as any).address?.formattedAddress,
    (hotel as any).address?.streetAddress,
    (hotel as any).address?.landmark,
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  for (const locStr of locationStrings) {
    if (matchesText(locStr, targetCity)) return true;

    for (const alias of aliases) {
      if (matchesText(locStr, alias)) return true;
    }

    const tokens = locStr
      .toLowerCase()
      .split(/[,/-]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    for (const token of tokens) {
      if (token === targetCity) return true;
      if (LOCALITY_TO_CITY[token] === targetCity) return true;
      if (aliases.includes(token)) return true;
    }

    for (const [locality, parentCity] of Object.entries(LOCALITY_TO_CITY)) {
      if (parentCity === targetCity) {
        const locRegex = new RegExp(
          `(?:^|[\\s,/-])${escapeRegex(locality)}(?:$|[\\s,/-])`,
          "i",
        );
        if (locRegex.test(locStr)) return true;
      }
    }
  }

  return false;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HotelCarouselManager Design Class
 * Manages progressive / infinite windowing and rendering for MainFramePage
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class HotelCarouselManager {
  readonly initialCount: number;
  readonly increment: number;
  readonly triggerOffset: number;

  constructor(options?: {
    initialCount?: number;
    increment?: number;
    triggerOffset?: number;
  }) {
    // Initial batch: render 8 carousels (covers first 4 viewport screens smoothly)
    this.initialCount = options?.initialCount ?? 8;
    // When threshold is hit, render 4 more carousels
    this.increment = options?.increment ?? 4;
    // Trigger when user scrolls and reaches the (visibleCount - 2) carousel (i.e. 6th carousel initially)
    this.triggerOffset = options?.triggerOffset ?? 2;
  }

  /**
   * Determine ranked banner placement between carousels
   */
  getBannerRank(carouselIndex: number): "A" | "B" | "C" | null {
    if (carouselIndex === 0) return "A";
    if (carouselIndex === 2) return "B";
    if (carouselIndex === 4) return "C";
    return null;
  }

  /**
   * Calculate next visible count
   */
  getNextVisibleCount(currentCount: number, totalCount: number): number {
    return Math.min(totalCount, currentCount + this.increment);
  }

  /**
   * Determine the 0-based index that should act as the intersection trigger
   * e.g. for visibleCount = 8, triggerIndex is (8 - 2 - 1) = 5 (the 6th carousel)
   */
  getTriggerIndex(visibleCount: number, totalCount: number): number {
    if (visibleCount >= totalCount) return -1;
    return Math.max(0, visibleCount - this.triggerOffset - 1);
  }

  /**
   * Format hotels into carousel Item format
   */
  formatHotelItems(hotels: hoteldata[]): Item[] {
    return hotels.map(
      (hotel: hoteldata): Item => ({
        id: hotel._id,
        _id: hotel._id,
        title: hotel.name,
        location: `${hotel.city}, ${hotel.country || "India"}`,
        image: hotel.image,
        href: `/hotels/${hotel._id}`,
        price: hotel.startingPrice ?? null,
        rating: (hotel as any).rating,
        numReviews: (hotel as any).numReviews,
        amenities: (hotel as any).amenities,
        isFavorite: (hotel as any).isFavorite,
      })
    );
  }
}

// Singleton manager instance for MainFramePage
const carouselManager = new HotelCarouselManager({
  initialCount: 8,
  increment: 4,
  triggerOffset: 2,
});

/**
 * MainFramePage Component
 * Handles progressive carousel rendering and responsive watermelon UI
 */
const MainFramePage = ({
  className,
  type,
  popularTrends,
}: HotelFramePageProps) => {
  const { data, isLoading, error } = useGetNewHotels();

  // 1. Resolve active sections with items:
  // Priority 1: Backend pre-calculated sections from MongoDB PopularSection model
  // Priority 2: Fallback to client-side matching using DEFAULT_POPULAR_SECTIONS
  const allSectionsWithItems: DestinationSectionWithItems[] = useMemo(() => {
    if (isLoading) {
      return DEFAULT_POPULAR_SECTIONS.slice(0, 2).map((section) => ({
        section,
        items: [] as Item[],
      }));
    }

    // Backend returned pre-calculated sections
    if ((data as any)?.sections && Array.isArray((data as any).sections) && (data as any).sections.length > 0) {
      return (data as any).sections as DestinationSectionWithItems[];
    }

    // Client-side fallback matching
    const allHotels: hoteldata[] = data?.data || [];
    return DEFAULT_POPULAR_SECTIONS.map((section) => {
      const matchingHotels = allHotels.filter((hotel) =>
        matchesSectionCity(hotel, section)
      );

      const limit = section.limit || 12;
      const sliced = matchingHotels.slice(0, limit);
      const items = carouselManager.formatHotelItems(sliced);

      return { section, items };
    }).filter(({ items }) => items.length > 0);
  }, [isLoading, data]);

  // 2. Progressive rendering state
  // Initial count is 8 (or total if less)
  const [visibleCount, setVisibleCount] = useState<number>(carouselManager.initialCount);

  // Reset or adjust visibleCount when sections change
  useEffect(() => {
    if (!isLoading && allSectionsWithItems.length > 0) {
      setVisibleCount((prev) =>
        prev > carouselManager.initialCount
          ? Math.min(allSectionsWithItems.length, prev)
          : Math.min(allSectionsWithItems.length, carouselManager.initialCount)
      );
    }
  }, [allSectionsWithItems.length, isLoading]);

  // 3. Load more handler
  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      carouselManager.getNextVisibleCount(prev, allSectionsWithItems.length)
    );
  }, [allSectionsWithItems.length]);

  // 4. Sentinel / Intersection trigger index:
  // For visibleCount = 8, triggerIndex is index 5 (6th carousel).
  // When scrolled into view, it loads 4 more!
  const triggerIndex = carouselManager.getTriggerIndex(
    visibleCount,
    allSectionsWithItems.length
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      if (node && triggerIndex >= 0) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadMore();
            }
          },
          {
            rootMargin: "300px 0px", // Trigger slightly before reaching to ensure ultra-smooth transition
            threshold: 0.1,
          }
        );
        observerRef.current.observe(node);
      }
    },
    [triggerIndex, loadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Sliced sections to render
  const renderedSections = useMemo(() => {
    return allSectionsWithItems.slice(0, visibleCount);
  }, [allSectionsWithItems, visibleCount]);

  const hasMoreToLoad = visibleCount < allSectionsWithItems.length;

  return (
    <FrameColursals className={cn(className, "w-full space-y-6 sm:space-y-8")}>
      {renderedSections.map(({ section, items }, i) => {
        const bannerRank = carouselManager.getBannerRank(i);
        const isTrigger = i === triggerIndex;

        return (
          <React.Fragment key={section._id || section.tagline}>
            <div ref={isTrigger ? triggerNodeRef : undefined} className="w-full">
              <PopularDestinationCarousel
                tagline={section.tagline}
                city={section.city}
                tabs={popularTrends?.[0]?.tabs || undefined}
                type={type}
                items={items}
                isLoading={isLoading}
                icon={<MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              />
            </div>

            {/* Ranked Banner interleaved cleanly */}
            {bannerRank && (
              <RankedBanner rank={bannerRank} entityType="hotel" />
            )}
          </React.Fragment>
        );
      })}

      {/* Fallback banner if only 1 section is rendered */}
      {!isLoading && renderedSections.length === 1 && (
        <RankedBanner rank="B" entityType="hotel" />
      )}

      {/* Subtle watermelon-themed progressive loading indicator */}
      {hasMoreToLoad && (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span>Loading more destinations...</span>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center py-4 text-sm">
          Failed to load hotels: {error.message}
        </p>
      )}
    </FrameColursals>
  );
};

export default MainFramePage;
