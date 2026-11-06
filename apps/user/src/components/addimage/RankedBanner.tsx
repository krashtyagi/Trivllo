"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  Star,
  Building2,
  Crown,
  Play,
  Zap,
  ShieldCheck,
  Headphones,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRankedHotels } from "@/services/hotel/querys";
import { useGetRankedTourCompanies } from "@/services/tours/tours.queries";
import { RouterPush } from "../RouterPush";
import { optimizeCloudinaryUrl, IMAGE_PRESETS } from "@/lib/image-optimizer";

type RankedBannerProps = {
  rank: "A" | "B" | "C";
  entityType: "hotel" | "tour";
};

type BannerItem = {
  _id: string;
  name: string;
  city: string;
  image: string | null;
  rating?: number;
  numReviews?: number;
  description?: string;
};

const SLIDE_INTERVAL = 5000;
const PREFETCH_THRESHOLD = 8;
const PAGE_SIZE = 10;

const RANK_CONFIG = {
  A: {
    label: "Premium",
    badge:
      "border-amber-400/40 bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/60 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
  },
  B: {
    label: "Recommended",
    badge:
      "border-blue-400/40 bg-gradient-to-r from-blue-950/70 via-black/80 to-blue-950/60 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  C: {
    label: "Featured",
    badge:
      "border-emerald-400/40 bg-gradient-to-r from-emerald-950/70 via-black/80 to-emerald-950/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  },
} as const;

/**
 * Format title into 2 clean lines so long names never wrap into 3-4 giant lines
 */
function splitName(name: string) {
  if (!name) return { first: "Hotel", rest: "Trivllo" };
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) {
    return { first: words[0], rest: words.slice(1).join(" ") || "Trivllo" };
  }
  // For long names like "Sylvan Hues Boutique Resort":
  // Line 1: first 2 words ("Sylvan Hues")
  // Line 2: remaining words ("Boutique Resort")
  const mid = Math.ceil(words.length / 2);
  return {
    first: words.slice(0, mid).join(" "),
    rest: words.slice(mid).join(" "),
  };
}

function formatReviewCount(count?: number) {
  if (!count || count <= 0) return "1.2k+ reviews";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+ reviews`;
  return `${count} reviews`;
}

// ─── Main RankedBanner Component ────────────────────────────────────
export default function RankedBanner({ rank, entityType }: RankedBannerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isHotel = entityType === "hotel";
  const linkPrefix = isHotel ? "/hotels" : "/tours";
  const rankConfig = RANK_CONFIG[rank];

  const containerRef = useRef<HTMLDivElement>(null);
  // Viewport lazy loading: only triggers TanStack Query when scrolled within 300px
  const isInView = useInView(containerRef, { once: true, margin: "300px 0px" });

  const hotelQuery = useGetRankedHotels(isHotel ? rank : "");
  const tourQuery = useGetRankedTourCompanies(isHotel ? "" : rank);
  const query = isHotel ? hotelQuery : tourQuery;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    query;

  const allItems: BannerItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items || []);
  }, [data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const effectiveLength = allItems.length;

  const handleNext = useCallback(() => {
    if (effectiveLength === 0) return;
    setCurrentIndex((prev) => (prev + 1) % effectiveLength);
  }, [effectiveLength]);

  // Infinite prefetching integration
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const batchPosition = currentIndex % PAGE_SIZE;

    if (batchPosition >= PREFETCH_THRESHOLD - 1) {
      fetchNextPage();
    }
  }, [currentIndex, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-play interval with pause on hover
  useEffect(() => {
    if (!isInView || effectiveLength <= 1 || isPaused) return;

    const slideTimer = setInterval(() => {
      handleNext();
    }, SLIDE_INTERVAL);

    return () => clearInterval(slideTimer);
  }, [isInView, effectiveLength, handleNext, isPaused]);

  const currentItem = allItems[currentIndex];

  const handlePrefetch = useCallback(() => {
    if (!currentItem?._id) return;
    if (linkPrefix.includes("tour")) {
      queryClient.prefetchQuery({
        queryKey: ["getTourDetails", currentItem._id],
        queryFn: async () => {
          const { axiosApi } = await import("@/lib/axios");
          const res = await axiosApi.get(
            `/tour-services/company/${currentItem._id}`,
          );
          return res.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    } else {
      queryClient.prefetchQuery({
        queryKey: ["hotel_details", currentItem._id],
        queryFn: async () => {
          const { getHotelDetails } =
            await import("@/services/hotel/hotel.service");
          return getHotelDetails(currentItem._id);
        },
        staleTime: 5 * 60 * 1000,
      });
    }
    router.prefetch(`${linkPrefix}/${currentItem._id}`);
  }, [currentItem?._id, linkPrefix, queryClient, router]);

  if (!isLoading && allItems.length === 0) return null;

  // Loading skeleton screen
  if (isLoading || !currentItem) {
    return (
      <div ref={containerRef} className="w-full my-3 md:my-6">
        <div className="h-[28rem] sm:h-[32rem] md:h-[35rem] w-full md:rounded-[36px] bg-zinc-900/60 animate-pulse border border-zinc-800 flex flex-col justify-between p-4 sm:p-8 md:p-12">
          <div className="space-y-3">
            <div className="h-5 w-24 bg-zinc-800 rounded-full" />
            <div className="h-8 sm:h-11 w-2/3 md:w-1/2 bg-zinc-800 rounded-lg" />
            <div className="h-3.5 w-1/3 bg-zinc-800 rounded-md" />
            <div className="h-9 w-32 bg-zinc-800 rounded-full" />
          </div>
          <div className="h-12 w-full bg-zinc-800/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { first, rest } = splitName(currentItem.name);
  const city = currentItem.city || "Dhampur";
  const optimizedImg = currentItem.image
    ? optimizeCloudinaryUrl(currentItem.image, IMAGE_PRESETS.rankedBanner)
    : null;

  const description =
    currentItem.description ||
    `Introducing a smarter way to manage your hospitality business with Trivllo.`;

  return (
    <div
      ref={containerRef}
      className="w-full my-3 md:my-6 overflow-hidden md:rounded-[36px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Main Frame: Completely Static, Never Jumps Horizontally ── */}
      <div className="relative h-[25rem] xs:h-[29rem] sm:h-[32rem] md:h-[35rem] lg:h-[36rem] w-full md:rounded-[36px] overflow-hidden bg-zinc-950 shadow-2xl border-y md:border border-white/10 flex flex-col justify-between">
        {/* ── 1. Background Image Layer: Vanishes/Appears with Smooth Crossfade ── */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentItem._id || currentItem.image || currentIndex}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              {optimizedImg ? (
                <img
                  src={optimizedImg}
                  alt={currentItem.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center transform-gpu"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-zinc-700" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 2. Cinematic Gradient Overlays ── */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 z-10 pointer-events-none" />

        {/* ── 3. Content Area: Typography Glides In with Deceleration Curve ── */}
        <div className="relative z-20 flex-1 flex flex-col justify-center items-start p-4 sm:p-7 md:p-10 max-w-xl min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem._id}
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-start"
            >
              {/* Glowing Rank Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider border backdrop-blur-md mb-2 sm:mb-3 shadow-sm",
                  rankConfig.badge,
                )}
              >
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span>{rankConfig.label}</span>
              </div>

              {/* Two-Line Luxury Typography (Capped to Max 2 Lines so Amenity Dock is Never Pushed Down) */}
              <div className="drop-shadow-lg mb-0.5 sm:mb-1 w-full max-w-full">
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] line-clamp-1">
                  {first}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 max-w-full">
                  <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-amber-200 tracking-wide line-clamp-1">
                    {rest}
                  </span>
                  <span className="inline-block text-amber-400 text-sm sm:text-base shrink-0">
                    ✦
                  </span>
                </div>
                {/* Subtle Golden Flourish Curve Line */}
                <svg
                  className="w-16 sm:w-24 h-1.5 sm:h-2 text-amber-400/80 my-0.5 sm:my-1"
                  viewBox="0 0 100 8"
                  fill="none"
                >
                  <path
                    d="M0 4 Q25 8 50 4 T100 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Tagline & Body */}
              <p className="text-white/95 text-[11px] sm:text-sm font-semibold tracking-wide drop-shadow-sm mt-0.5 sm:mt-1 line-clamp-1">
                Your Hospitality Business. Your Rules.
              </p>
              <p className="text-white/70 text-[10px] sm:text-xs leading-relaxed max-w-md line-clamp-2 drop-shadow-sm mt-0.5 sm:mt-1 mb-2.5 sm:mb-4">
                {description}
              </p>

              {/* Location & Rating Badges */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/90 font-medium mb-3 sm:mb-4 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/55 border border-white/15 backdrop-blur-md shadow-sm">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                  <span>{city}, India</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/55 border border-white/15 backdrop-blur-md shadow-sm">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-white">
                    {currentItem.rating && currentItem.rating > 0
                      ? currentItem.rating.toFixed(1)
                      : "4.0"}
                  </span>
                  <span className="text-white/60">
                    ({formatReviewCount(currentItem.numReviews)})
                  </span>
                </div>
              </div>

              {/* Action Buttons: Explore Details + Watch Preview */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={handlePrefetch}
                  onPointerDown={handlePrefetch}
                  onFocus={handlePrefetch}
                  onClick={() => {
                    handlePrefetch();
                    RouterPush(router, `${linkPrefix}/${currentItem._id}`);
                  }}
                  className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#ffe07d] via-[#f5b82e] to-[#e89b27] hover:brightness-105 active:scale-95 text-stone-950 font-bold text-[11px] sm:text-sm shadow-[0_4px_20px_rgba(245,183,51,0.45)] transition-all cursor-pointer"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    handlePrefetch();
                    RouterPush(router, `${linkPrefix}/${currentItem._id}`);
                  }}
                  className="inline-flex items-center gap-2 sm:gap-2.5 text-white/90 hover:text-white text-[11px] sm:text-sm font-semibold transition-colors group cursor-pointer"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/55 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                  </div>
                  <span>Watch Preview</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 4. Bottom 4-Feature Amenity Dock: Pinned & ALWAYS Visible ── */}
        <div className="relative z-20 w-full px-2.5 sm:px-5 pb-2.5 sm:pb-4 shrink-0 mt-auto">
          <div className="w-full backdrop-blur-xl bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 grid grid-cols-4 gap-1 text-center shadow-lg">
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-1 border-r border-white/10">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 mb-0.5 sm:mb-1" />
              <span className="text-[8.5px] sm:text-[11px] font-medium text-white/90 leading-tight">
                Smart
                <br className="sm:hidden" /> Management
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-1 border-r border-white/10">
              <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 mb-0.5 sm:mb-1" />
              <span className="text-[8.5px] sm:text-[11px] font-medium text-white/90 leading-tight">
                Secure &<br className="sm:hidden" /> Reliable
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-1 border-r border-white/10">
              <Headphones className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 mb-0.5 sm:mb-1" />
              <span className="text-[8.5px] sm:text-[11px] font-medium text-white/90 leading-tight">
                24/7
                <br className="sm:hidden" /> Support
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 mb-0.5 sm:mb-1" />
              <span className="text-[8.5px] sm:text-[11px] font-medium text-white/90 leading-tight">
                Grow Your
                <br className="sm:hidden" /> Business
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
