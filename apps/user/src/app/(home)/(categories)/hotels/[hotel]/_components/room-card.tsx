"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Square, Bed, ChevronLeft, ChevronRight } from "lucide-react";
import { amenityIconMap } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useHotelStore } from "@/store/hotel.store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSliderIfNotChooseDate } from "../_providers_context/SliderIfNotChooseDate";
import { motion } from "framer-motion"; // fixed typo: motion/react → framer-motion
import { useState, useCallback } from "react";
import { Spinner } from "@/components/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeCloudinaryUrl, IMAGE_PRESETS } from "@/lib/image-optimizer";

export interface RoomCardProps {
  hotelId: string;
  showReserveButton?: boolean;
  isStale?: boolean;
  id: string;
  title: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  totalPrice?: number;
  nights: number;
  rating: number;
  reviewCount: number;
  displayPrice: number;
  beds: string;
  guests: number;
  size: number;
  amenities: { name: string; icon: string }[];
  roomsLeft: number;
  discountPercent?: number;
  isBookingMode: boolean;
  taxPercentage: number;
  totalTax: number;
  totalPriceWithTax: number;
  roomImages?: string[];
}
import NProgress from "nprogress";
import { RouterPush } from "@/components/RouterPush";
import { formatLabel } from "@/components/side-bar-filter/pillGroup";
export function HotelRoomCard({
  hotelId,
  id,
  title,
  imageUrl,
  originalPrice,
  discountedPrice,
  totalPrice,
  taxPercentage,
  totalTax,
  totalPriceWithTax,
  nights,
  rating,
  reviewCount,
  beds,
  guests,
  displayPrice,
  size,
  amenities,
  roomsLeft,
  discountPercent = 0,
  isBookingMode,
  isStale = false,
  showReserveButton = false,
  roomImages,
}: RoomCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSelectedRoom, date } = useHotelStore();
  const { handleClick } = useSliderIfNotChooseDate();
  const bothdate = !!date?.to && !!date?.from;

  // Image slider state
  const slides =
    roomImages && roomImages.length > 0
      ? roomImages.map((img) =>
          typeof img === "string"
            ? { url: img }
            : { url: (img as { url: string }).url || "/hotels/img1.png" },
        )
      : [{ url: imageUrl || "/hotels/img1.png" }];
  const [imgIdx, setImgIdx] = useState(0);
  const prevImg = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setImgIdx((i) => (i === 0 ? slides.length - 1 : i - 1));
    },
    [slides.length],
  );
  const nextImg = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setImgIdx((i) => (i === slides.length - 1 ? 0 : i + 1));
    },
    [slides.length],
  );

  // Instagram-style pagination dots (max 5 dots with edge scaling)
  const maxDots = 5;
  const getVisibleDots = () => {
    if (slides.length <= maxDots) {
      return slides.map((_, i) => ({
        index: i,
        isActive: i === imgIdx,
        isSmall: false,
      }));
    }
    const startIdx = Math.max(0, Math.min(imgIdx - 2, slides.length - maxDots));
    return Array.from({ length: maxDots }).map((_, i) => {
      const actualIdx = startIdx + i;
      const isActive = actualIdx === imgIdx;
      const isLeftEdge = i === 0 && startIdx > 0;
      const isRightEdge =
        i === maxDots - 1 && startIdx + maxDots < slides.length;
      return {
        index: actualIdx,
        isActive,
        isSmall: isLeftEdge || isRightEdge,
      };
    });
  };

  const handleReserve = () => {
    if (!bothdate) {
      handleClick();
      toast.message("Please select date first");
      return;
    }
    setLoading(true);
    const route = `/book/${hotelId}/${id}`;
    localStorage.setItem("nextRoute", route);
    if (isBookingMode && roomsLeft === 0) return;
    setSelectedRoom({
      hotelId,
      roomTypeId: id,
      title,
      image: imageUrl,
      pricePerNight: discountedPrice,
      totalPrice: totalPrice || discountedPrice,
      taxPercentage,
      totalTax,
      totalPriceWithTax,
      nights,
    });
    RouterPush(router, route);
  };
  return (
    <Card
      className={cn(
        "w-full overflow-hidden border border-border/60 bg-card",
        "hover:shadow-lg transition-all duration-300 rounded-2xl mb-4 last:mb-0",
        "dark:hover:shadow-[0_8px_20px_rgba(255,255,255,0.06)]",
        "md:max-h-[260px]",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)_220px]",
          "lg:grid-cols-[280px_minmax(0,1fr)_230px]",
          "min-h-[220px] md:h-[260px] md:max-h-[260px]",
        )}
      >
        {/* IMAGE SECTION with slider */}
        <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full overflow-hidden flex-shrink-0 p-2 md:p-3 group/slider">
          <motion.div
            layoutId={`image-${id}`}
            className="w-full h-full bg-muted rounded-xl md:rounded-2xl overflow-hidden"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <img
              src={optimizeCloudinaryUrl(slides[imgIdx]?.url || "/hotels/img1.png", IMAGE_PRESETS.roomCardThumb)}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-xl md:rounded-2xl transition-opacity duration-300"
            />
          </motion.div>

          {slides.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
              <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {getVisibleDots().map((dot) => (
                  <span
                    key={dot.index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgIdx(dot.index);
                    }}
                    className={cn(
                      "rounded-full cursor-pointer transition-all duration-200",
                      dot.isActive
                        ? "w-4 h-1.5 bg-white shadow-sm"
                        : dot.isSmall
                          ? "w-1 h-1 bg-white/30"
                          : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {discountPercent > 0 && (
            <div className="absolute top-4 right-4 md:top-5 md:right-5 bg-primary text-primary-foreground text-[10px] md:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* CONTENT SECTION – reduced vertical spacing */}
        <div className="p-4 md:p-3.5 lg:p-4 min-w-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div className="space-y-2 md:space-y-2.5 min-w-0">
            <div className="flex items-start justify-between gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base md:text-lg lg:text-xl font-bold leading-tight line-clamp-2 md:line-clamp-1"
                  title={title}
                >
                  {title}
                </h3>
                {isBookingMode && (
                  <p
                    className={cn(
                      "text-[11px] md:text-xs font-semibold mt-0.5",
                      roomsLeft <= 3
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {roomsLeft > 0
                      ? `${roomsLeft} room${roomsLeft !== 1 ? "s" : ""} left`
                      : "Not available for selected dates"}
                  </p>
                )}
              </div>
              {rating > 0 && reviewCount > 0 && (
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] md:text-[11px] font-bold text-primary uppercase tracking-tight">
                      {rating >= 4.5
                        ? "Excellent"
                        : rating >= 3.5
                          ? "Very Good"
                          : rating >= 2.5
                            ? "Good"
                            : "Rated"}
                    </span>
                    <div className="bg-primary text-primary-foreground text-[11px] md:text-xs font-bold px-1.5 py-0.5 rounded">
                      {rating.toFixed(1)}
                    </div>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">
                    {reviewCount.toLocaleString()}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6 py-2 md:py-3 border-y border-border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-foreground">
                  <Bed size={14} className="text-muted-foreground" />
                  <span className="text-[11px] md:text-xs font-semibold">
                    {beds}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-[11px] md:text-xs font-semibold">
                    {guests} Persons
                  </span>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-border hidden sm:block" />
              <div className="flex items-center gap-1.5 text-foreground">
                <Square size={14} className="text-muted-foreground" />
                <span className="text-[11px] md:text-xs font-semibold">
                  {size} m²
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2 text-muted-foreground">
              {amenities.slice(0, 6).map((amenity) => {
                const Icon = amenityIconMap[amenity.icon];
                return (
                  <div
                    key={amenity.name}
                    className="flex items-center gap-1 text-[10px] md:text-xs font-medium bg-muted/60 px-2.5 py-1 rounded-full border border-border whitespace-nowrap"
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    <span className="md:block hidden">
                      {formatLabel(amenity.name)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRICING & CTA – smaller button on mobile */}
        <div className="bg-muted/20 p-4 md:p-3.5 lg:p-4 flex flex-col justify-between items-end">
          <div className="text-right space-y-1.5 md:space-y-2">
            {
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            }
            <div className="flex items-baseline justify-end gap-1">
              {totalPrice ? (
                <span className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground">
                  ₹{totalPrice?.toLocaleString()}
                </span>
              ) : (
                <span className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground">
                  ₹{discountedPrice.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase">
                {totalPrice
                  ? `for ${nights} ${nights === 1 ? "night" : "nights"}`
                  : "/ night"}
              </span>
            </div>
          </div>

          {showReserveButton && (
            <div className="w-full mt-4 md:mt-5">
              <Button
                disabled={(isBookingMode && roomsLeft === 0) || loading}
                size="sm"
                className={cn(
                  "w-full h-9 md:h-11 lg:h-12 font-semibold rounded-xl text-sm md:text-base",
                  isBookingMode && roomsLeft === 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary hover:bg-primary/90 shadow-sm",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReserve();
                }}
              >
                {isBookingMode && bothdate && roomsLeft === 0 ? (
                  "Not Available"
                ) : loading ? (
                  <Spinner />
                ) : bothdate ? (
                  "Reserve"
                ) : (
                  "Select Dates"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function HotelRoomCardSkeleton() {
  return (
    <Card
      className={cn(
        "w-full overflow-hidden border border-border/60 bg-card",
        "rounded-2xl mb-4 last:mb-0",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)_220px]",
          "lg:grid-cols-[320px_minmax(0,1fr)_240px]",
          "min-h-[220px] md:min-h-[260px]",
        )}
      >
        {/* IMAGE SECTION */}
        <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full overflow-hidden flex-shrink-0 p-2 md:p-3">
          <Skeleton className="w-full h-full rounded-xl md:rounded-2xl" />
        </div>

        {/* CONTENT SECTION */}
        <div className="p-4 md:p-5 lg:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start justify-between gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 md:h-7 lg:h-8 w-[80%] max-w-[300px]" />
                <Skeleton className="h-4 md:h-5 w-[100px] mt-2" />
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <Skeleton className="h-4 w-12 rounded mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 py-2 md:py-3 border-y border-border">
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2 text-muted-foreground mt-2">
              <Skeleton className="h-6 md:h-7 w-20 rounded-full" />
              <Skeleton className="h-6 md:h-7 w-24 rounded-full" />
              <Skeleton className="h-6 md:h-7 w-16 rounded-full" />
              <Skeleton className="h-6 md:h-7 w-28 rounded-full" />
              <Skeleton className="h-6 md:h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* PRICING & CTA SECTION */}
        <div className="bg-muted/20 p-4 md:p-5 lg:p-6 flex flex-col justify-between items-end">
          <div className="text-right space-y-1.5 md:space-y-2 w-full flex flex-col items-end">
            <Skeleton className="h-4 md:h-5 w-16" />
            <Skeleton className="h-8 md:h-10 lg:h-12 w-32 mt-1" />
          </div>

          <div className="w-full mt-4 md:mt-5">
            <Skeleton className="w-full h-9 md:h-11 lg:h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </Card>
  );
}
