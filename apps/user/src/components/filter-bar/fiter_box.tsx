"use client";

import { SearchBoxValuesProps } from "@/constants/constants";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Spinner } from "../spinner";
import { RouterPush } from "../RouterPush";
import { useHotelStore } from "@/store/hotel.store";
import { useToursStore } from "@/store/tours.store";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Calendar,
  User,
  Search,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Building2,
  Mountain,
} from "lucide-react";

const FilterBox = ({
  FilterBoxValues,
  link = "/hotels",
  directions,
  city,
  date,
  guests,
}: {
  city: string;
  date: DateRange | undefined;
  guests: { adults: number; children: number };
  FilterBoxValues: SearchBoxValuesProps;
  link?: string;
  type?: string;
  directions: React.ReactNode;
}) => {
  const router = useRouter();
  const ismobile = useIsMobile();
  const { setCity: setHotelCity } = useHotelStore();
  const { setCity: setTourCity } = useToursStore();

  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const isTour = link?.includes("tour");

  const featuredSpots = isTour
    ? [
        {
          city: "Rishikesh",
          tagline: "White waters, Himalayan heights, unforgettable thrills.",
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        },
        {
          city: "Manali",
          tagline: "Snowy peaks, cozy stays, unforgettable memories.",
          image:
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        },
        {
          city: "Goa",
          tagline: "Golden beaches, azure waters, vibrant tropical energy.",
          image:
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        },
      ]
    : [
        {
          city: "Manali",
          tagline: "Snowy peaks, cozy stays, unforgettable memories.",
          image:
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        },
        {
          city: "Rishikesh",
          tagline: "Riverside luxury, yoga retreats, sacred Himalayan sunsets.",
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        },
        {
          city: "Goa",
          tagline: "Heritage Portuguese villas & private beachfront suites.",
          image:
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        },
      ];

  const currentFeatured = featuredSpots[featuredIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const startTimer = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!timer) {
        timer = setInterval(() => {
          setFeaturedIndex((prev) => (prev + 1) % featuredSpots.length);
        }, 6000);
      }
    };
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [featuredSpots.length]);

  const handleSearchClick = () => {
    const targetCity = city || "manali";
    if (!city) {
      if (isTour) {
        setTourCity("manali");
      } else {
        setHotelCity("manali");
      }
    }
    setLoading(true);
    const searchUrl = isTour
      ? `/tours/find?city=${encodeURIComponent(targetCity.trim().toLowerCase())}`
      : `/hotels/find?city=${encodeURIComponent(targetCity.trim().toLowerCase())}`;
    RouterPush(router, searchUrl);
  };

  const handleFeaturedClick = (targetCity: string) => {
    const citySlug = encodeURIComponent(targetCity.trim().toLowerCase());
    if (isTour) {
      setTourCity(targetCity.toLowerCase());
      RouterPush(router, `/tours/find?city=${citySlug}`);
    } else {
      setHotelCity(targetCity.toLowerCase());
      RouterPush(router, `/hotels/find?city=${citySlug}`);
    }
  };

  const displayDateRange =
    date?.from && date?.to
      ? `${format(new Date(date.from), "dd MMM")} - ${format(new Date(date.to), "dd MMM")}`
      : date?.from
        ? `${format(new Date(date.from), "dd MMM")}`
        : "Add dates";
  const displayGuests =
    guests?.adults || guests?.children
      ? `${guests.adults || 1} Adult${(guests.adults || 1) > 1 ? "s" : ""}${
          guests.children ? `, ${guests.children} Child` : ""
        }`
      : "1 Adult";

  const videoList =
    FilterBoxValues?.videos && FilterBoxValues.videos.length > 0
      ? FilterBoxValues.videos
      : [
          {
            title: "Capture the Joy.",
            description:
              "450+ vacation rentals, 120 local guides, and endless memories.",
            link: "/search-box-videos/sardaar.mp4",
          },
          {
            title: "Classic Rooms.",
            description: "Stay in comfort and style.",
            link: "/search-box-videos/room.mp4",
          },
        ];

  const videoIndex = featuredIndex % videoList.length;
  const activeVideo = videoList[videoIndex];

  return (
    <>
      {/* MOBILE VIEW (Matching Image 2) */}
      {/* MOBILE VIEW (Matching Image 2) */}
      <div className="md:hidden w-full">
        {/* Scenic Background Hero Area */}
        <div
          className="w-full relative z-30 bg-cover bg-center pt-2.5 pb-2.5 px-3"
          style={{
            backgroundImage: `url('/hotels/main_page_bg.png')`,
            backgroundPosition: "center 28%",
          }}
        >
          {/* Subtle gradient to ensure clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-white/70 pointer-events-none" />

          <div className="relative z-10 max-w-sm mb-1.5">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-[1.12]">
              {isTour ? "Find Your Next Adventure" : "Find Your Perfect Stay"}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-700 font-medium leading-tight mt-0.5 max-w-[280px]">
              {isTour
                ? "Discover guided treks, rafting, and bespoke expeditions across India."
                : "Discover handpicked hotels, from cozy stays to luxury escapes, across India."}
            </p>
          </div>

          {/* Integrated Squircle Tab + Search Card sharing common boundary with aesthetic inverted curves */}
          <div className="relative z-40 w-full mt-2 filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
            {/* Top Tab for Hotels / Tours seamlessly joined with search card via inverted curves */}
            <div className="relative flex justify-center">
              <div className="relative bg-white dark:bg-zinc-900 px-1 pt-1 pb-1.5 rounded-t-[18px] border-t border-x border-black/[0.06] dark:border-white/[0.08] flex items-center -mb-[1px] z-20">
                {/* Left Inverted Curve (Concave scoop fillet) */}
                <svg
                  className="absolute -left-4 bottom-0 w-4 h-4 text-white dark:text-zinc-900 pointer-events-none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M16 0 C16 8.836 8.836 16 0 16 L16 16 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 0 C16 8.836 8.836 16 0 16"
                    fill="none"
                    stroke="rgba(0,0,0,0.06)"
                    className="dark:stroke-white/10"
                    strokeWidth="1"
                  />
                </svg>

                {/* Right Inverted Curve (Concave scoop fillet) */}
                <svg
                  className="absolute -right-4 bottom-0 w-4 h-4 text-white dark:text-zinc-900 pointer-events-none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M0 0 C0 8.836 7.164 16 16 16 L0 16 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M0 0 C0 8.836 7.164 16 16 16"
                    fill="none"
                    stroke="rgba(0,0,0,0.06)"
                    className="dark:stroke-white/10"
                    strokeWidth="1"
                  />
                </svg>

                {/* Sliding Category Toggle */}
                <div className="relative flex items-center bg-[#f0f4f1] dark:bg-zinc-800/90 rounded-full p-0.5 w-[172px]">
                  {/* Sliding pill indicator */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className={cn(
                      "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-[#0c3926] shadow-sm",
                      isTour ? "left-[calc(50%+1px)]" : "left-0.5",
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (isTour) RouterPush(router, "/hotels");
                    }}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer select-none",
                      !isTour
                        ? "text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white",
                    )}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hotels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isTour) RouterPush(router, "/tours");
                    }}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer select-none",
                      isTour
                        ? "text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white",
                    )}
                  >
                    <Mountain className="w-3.5 h-3.5" />
                    <span>Tours</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Card Body (Short height & compact) */}
            <div className="relative z-40 bg-white dark:bg-zinc-900 rounded-[22px] p-2.5 pt-2.5 sm:p-3 sm:pt-3 shadow-sm border border-black/[0.06] dark:border-white/[0.08]">
              <div className="w-full relative z-50">{directions}</div>

              <div className="grid gap-1 mt-1.5 grid-cols-2">
                <div
                  onClick={() => setActiveIdx(0)}
                  className="border border-gray-200/90 dark:border-zinc-700/80 rounded-xl px-1.5 py-1 min-[360px]:px-2 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <Calendar className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-[#0c3926] dark:text-emerald-400 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[6.5px] min-[280px]:text-[7px] min-[360px]:text-[8px] font-bold tracking-tight text-muted-foreground uppercase leading-none whitespace-nowrap block truncate">
                        {isTour ? "BOOKING DATE" : "CHECK-IN - CHECK-OUT"}
                      </span>
                      <span className="text-[9.5px] min-[360px]:text-[11px] font-bold text-foreground truncate mt-0.5 leading-none">
                        {displayDateRange}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 text-muted-foreground shrink-0 ml-0.5" />
                </div>

                <div
                  onClick={() => setActiveIdx(1)}
                  className="border border-gray-200/90 dark:border-zinc-700/80 rounded-xl px-1.5 py-1 min-[360px]:px-2 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <User className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-[#0c3926] dark:text-emerald-400 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[6.5px] min-[280px]:text-[7px] min-[360px]:text-[8px] font-bold tracking-tight text-muted-foreground uppercase leading-none whitespace-nowrap block truncate">
                        GUESTS
                      </span>
                      <span className="text-[9.5px] min-[360px]:text-[11px] font-bold text-foreground truncate mt-0.5 leading-none">
                        {displayGuests}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 text-muted-foreground shrink-0 ml-0.5" />
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearchClick}
                disabled={loading}
                className="mt-1.5 w-full bg-[#0c3926] hover:bg-[#072619] text-white font-bold text-xs h-7.5 sm:h-8 rounded-full shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>{isTour ? "Search Tours" : "Search Hotels"}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="mt-1.5 pt-1 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[7.5px] min-[360px]:text-[8.5px] text-muted-foreground font-medium px-0.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Best Prices</span>
                </span>
                <span className="text-gray-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Verified Properties</span>
                </span>
                <span className="text-gray-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>24/7 Support</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Card (Explore Manali banner matching Image 2) */}
        <div className="px-3 pt-2 pb-0.5 relative z-0">
          <div
            onClick={() => handleFeaturedClick(currentFeatured.city)}
            className="w-full h-[125px] sm:h-[140px] rounded-2xl overflow-hidden relative z-0 shadow-md group cursor-pointer border border-white/20 flex flex-col justify-between p-3 sm:p-3.5"
            style={{
              backgroundImage: `url(${currentFeatured.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15 group-hover:from-black/90 transition-colors" />

            <div className="relative z-0 flex justify-between items-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-emerald-950 font-bold text-[9px] shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                Featured
              </span>
            </div>

            <div className="relative z-0 space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-white drop-shadow">
                Explore {currentFeatured.city}
              </h3>
              <p className="text-[10px] text-white/90 drop-shadow line-clamp-1 max-w-xs font-medium leading-snug">
                {currentFeatured.tagline}
              </p>
              <div className="pt-1 flex items-center justify-between">
                <button className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white border border-white/30 text-[10px] font-semibold shadow transition-all active:scale-95 cursor-pointer">
                  <span>{isTour ? "Explore Tours" : "Explore Hotels"}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>

                <div className="flex items-center gap-1">
                  {featuredSpots.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        featuredIndex === i
                          ? "w-3 bg-white"
                          : "w-1 bg-white/50",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLET & DESKTOP VIEW */}
      <div
        className="hidden md:flex w-full relative bg-cover bg-center py-8 md:py-10 min-h-[190px] md:min-h-[280px] items-center z-20"
        style={{
          backgroundImage: `url('/hotels/main_page_bg.png')`,
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />

        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-center">
            {/* Left Header & Filter */}
            <div className="col-span-12 xl:col-span-8 flex flex-col justify-center">
              <div className="max-w-2xl mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 leading-tight">
                  <span>
                    {isTour
                      ? "Find Your Next Adventure"
                      : "Find Your Perfect Stay"}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-normal max-w-xl mt-0.5">
                  {isTour
                    ? "Discover guided treks, thrilling river rafting, cultural journeys, and bespoke expeditions across India."
                    : "Discover handpicked hotels, from cozy stays to luxury escapes, across the most beautiful places in India."}
                </p>
              </div>

              {/* Compact Search Bar Container */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-1.5 sm:p-2 shadow-xl border border-black/5 dark:border-white/10">
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
                  {/* 1. Destination Field */}
                  <div
                    className={cn(
                      "relative z-30 flex items-center w-full",
                      isTour
                        ? "col-span-12 sm:col-span-4"
                        : "col-span-12 sm:col-span-3",
                    )}
                  >
                    <div className="w-full">{directions}</div>
                  </div>

                  {/* 2. Check-in - Check-out Field */}
                  <div
                    onClick={() => setActiveIdx(0)}
                    className={cn(
                      "flex items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors border border-transparent hover:border-border min-w-0",
                      isTour
                        ? "col-span-6 sm:col-span-3"
                        : "col-span-6 sm:col-span-4",
                    )}
                  >
                    <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground leading-none">
                        {isTour ? "Booking Date" : "Check-in - Check-out"}
                      </p>
                      <p className="text-xs font-semibold truncate text-foreground mt-0.5">
                        {displayDateRange}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>

                  {/* 3. Guests Field */}
                  <div
                    onClick={() => setActiveIdx(1)}
                    className={cn(
                      "flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors border border-transparent hover:border-border min-w-0",
                      isTour
                        ? "col-span-6 sm:col-span-2"
                        : "col-span-6 sm:col-span-2",
                    )}
                  >
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground leading-none">
                        Guests
                      </p>
                      <p className="text-xs font-semibold truncate text-foreground mt-0.5">
                        {displayGuests}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>

                  {/* 5. Search Button */}
                  <div
                    className={cn(
                      "flex justify-end w-full",
                      isTour
                        ? "col-span-12 sm:col-span-3"
                        : "col-span-12 sm:col-span-3",
                    )}
                  >
                    <Button
                      onClick={handleSearchClick}
                      disabled={loading}
                      className="w-full bg-[#0c3926] hover:bg-[#072619] text-white font-bold rounded-xl px-3 py-2.5 h-10 sm:h-11 text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {isTour ? "Search Tours" : "Search Hotels"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Compact Trust Badges */}
                <div className="mt-1.5 pt-1.5 border-t border-border/30 flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Best Prices</span>
                  </span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified Properties</span>
                  </span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-emerald-700" />
                    <span>24/7 Support</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Featured Card (XL Desktop) */}
            <div className="hidden xl:flex xl:col-span-4 w-full justify-center">
              <div
                onClick={() => handleFeaturedClick(currentFeatured.city)}
                className="w-full max-w-sm h-[200px] rounded-2xl overflow-hidden relative shadow-xl group cursor-pointer border border-white/30 flex flex-col justify-between p-4"
                style={{
                  backgroundImage: `url(${currentFeatured.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/90 transition-colors" />

                <div className="relative  flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-950 font-bold text-[10px] shadow">
                    <Sparkles className="w-3 h-3 text-emerald-800" />
                    Featured
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-bold text-white drop-shadow">
                    Explore {currentFeatured.city}
                  </h3>
                  <p className="text-[11px] text-white/90 drop-shadow line-clamp-2 max-w-xs font-medium">
                    {currentFeatured.tagline}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white border border-white/30 text-[11px] font-semibold shadow transition-all group-hover:scale-105 cursor-pointer">
                      <span>{isTour ? "Explore Tours" : "Explore Hotels"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      {featuredSpots.map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            featuredIndex === i
                              ? "w-4 bg-white"
                              : "w-1 bg-white/40",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Guest Picker Modal */}
      <Dialog
        open={activeIdx !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIdx(null);
        }}
      >
        <DialogContent
          className={cn(
            "z-[160] bg-background border border-border shadow-2xl rounded-2xl p-5",
            "w-[95%] max-w-[480px] md:max-w-[600px] max-h-[85vh] overflow-y-auto flex flex-col items-center",
          )}
        >
          <DialogTitle className="text-xs font-semibold text-muted-foreground self-start mb-2">
            {activeIdx !== null
              ? FilterBoxValues.filterBlocks[activeIdx]?.label
              : "Select Details"}
          </DialogTitle>
          <div className="w-full flex justify-center">
            {activeIdx !== null &&
              FilterBoxValues.filterBlocks[activeIdx]?.element}
          </div>
          <div className="mt-3 w-full flex justify-end">
            <Button
              onClick={() => setActiveIdx(null)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs px-4 py-1.5 cursor-pointer"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilterBox;
