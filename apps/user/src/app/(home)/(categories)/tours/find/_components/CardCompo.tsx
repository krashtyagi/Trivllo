"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React, { useState, useCallback } from "react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MapPin, Navigation, Building2, ZoomIn, Clock, Percent, Compass, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tour } from "@/context/TourContextProvider";
import { ImagePreview } from "@/app/(personal)/profile/_components/image-preview";
import { RouterPush } from "@/components/RouterPush";
import { StarRating } from "@/app/(home)/(categories)/_componentsRoot_categories/star-rating";
import { useRouter } from "next/navigation";
import { LikeIcon } from "@/services/dailyfunctions";

function ImageOverlay({ slides, initialIndex, onClose }: { slides: { url: string }[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const prev = useCallback(() => setIdx((i) => (i === 0 ? slides.length - 1 : i - 1)), [slides.length]);
  const next = useCallback(() => setIdx((i) => (i === slides.length - 1 ? 0 : i + 1)), [slides.length]);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[100] flex items-center justify-center outline-none"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <DialogPrimitive.Title className="sr-only">Image Gallery Overlay</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">View full-size images of the property</DialogPrimitive.Description>

          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={(e) => { e.stopPropagation(); onClose(); }}><X className="h-7 w-7" /></button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full p-2 z-10" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft className="h-6 w-6 text-white" /></button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full p-2 z-10" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="h-6 w-6 text-white" /></button>
          <img src={slides[idx]?.url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} className={cn("h-2 rounded-full cursor-pointer transition-all", i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60")} />)}
          </div>
          <span className="absolute top-4 left-4 text-white/70 text-sm font-medium">{idx + 1} / {slides.length}</span>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

type ToursCardProps = {
  tour: Tour;
  wrap?: boolean;
  favourite?: boolean;
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  `₹${v.toLocaleString("en-IN")}`;

const ratingLabel = (r: number) =>
  r >= 4.5 ? "Excellent" : r >= 3.5 ? "Very Good" : r >= 2.5 ? "Good" : "";

// ─── ToursCard ───────────────────────────────────────────────────────────────────

export const ToursCard = ({ tour, wrap, favourite }: ToursCardProps) => {
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const isHorizontal = !isMobile && !wrap;

  const {
    serviceId,
    title,
    destinations,
    duration,
    price,
    totalPriceWithTax,
    taxPercentage,
    thumbnail,
    company,
  } = tour;

  const [imgIdx, setImgIdx] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const thumbUrl = typeof thumbnail === "string" ? thumbnail : (thumbnail as any)?.url;
  const rawSlides = (tour.thumbnails && tour.thumbnails.length > 0 ? tour.thumbnails : (thumbUrl ? [{ url: thumbUrl }] : []))
    .map((item: any) => (typeof item === "string" ? { url: item } : item))
    .filter((item: any) => Boolean(item?.url));

  const slides = rawSlides.length > 1
    ? rawSlides
    : [
        ...(rawSlides.length > 0 ? rawSlides : [{ url: thumbUrl || "/tours/tour.png" }]),
        { url: "/adventures/ads1.jpg" },
        { url: "/adventures/ads2.jpg" },
      ];

  const prevImg = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => (i === 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);

  const nextImg = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => (i === slides.length - 1 ? 0 : i + 1));
  }, [slides.length]);

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
      const isRightEdge = i === maxDots - 1 && (startIdx + maxDots) < slides.length;
      return {
        index: actualIdx,
        isActive,
        isSmall: isLeftEdge || isRightEdge,
      };
    });
  };

  const mainDestination = destinations?.[0] || company?.city || "Unknown Location";

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Card className="group overflow-hidden rounded-xl border bg-card w-full shadow-md pt-0" onClick={() => RouterPush(navigate, `/tours/services/${serviceId}`)}>
        <div className="relative w-full h-[180px] group/slider">
          <img
            src={slides[imgIdx]?.url || "/tours/tour.png"}
            alt={title}
            onClick={(e) => {
              e.stopPropagation();
              setOverlayOpen(true);
            }}
            className="h-full w-full object-cover rounded-t-xl cursor-zoom-in"
          />
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/75 hover:bg-white text-gray-900 dark:text-white rounded-full p-1.5 shadow-md opacity-100 z-20 cursor-pointer transition-transform active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/75 hover:bg-white text-gray-900 dark:text-white rounded-full p-1.5 shadow-md opacity-100 z-20 cursor-pointer transition-transform active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                {getVisibleDots().map((dot) => (
                  <span
                    key={dot.index}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      dot.isActive
                        ? "w-4 h-1.5 bg-white"
                        : dot.isSmall
                          ? "w-1 h-1 bg-white/30"
                          : "w-1.5 h-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          {/* Duration badge */}
          {duration && (
            <div className="absolute left-2.5 top-2.5 bg-zinc-900/70 text-white backdrop-blur-md rounded-md px-2 py-1 text-[10px] font-medium flex items-center gap-1 shadow-sm border border-zinc-700/50">
              <Clock className="w-3 h-3" />
              {duration}
            </div>
          )}
        </div>
        {overlayOpen && <ImageOverlay slides={slides} initialIndex={imgIdx} onClose={() => setOverlayOpen(false)} />}

        <CardContent className="p-3.5 flex flex-col gap-2">
          {/* Title */}
          <h3
            className="text-base font-bold leading-tight cursor-pointer line-clamp-2"
            onClick={() => RouterPush(navigate, `/tours/services/${serviceId}`)}
          >
            {title}
          </h3>

          {/* Company & Location */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); RouterPush(navigate, `/tours/${company.companyId}`) }}>
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium line-clamp-1">{company?.name}</span>
            </div>
          </div>

          {/* Route info */}
          {destinations && destinations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium line-clamp-1 truncate">
                {destinations.join(" · ")}
              </span>
            </div>
          )}

          {/* Rating */}
          {company?.rating && company.rating > 0 ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-bold text-primary">
                  {ratingLabel(company.rating)}
                </span>
                <div className="flex gap-0.5">
                  <StarRating rating={company.rating} className="h-[11px] w-[11px]" />
                </div>
              </div>
              <div className="bg-primary text-white font-black h-8 w-8 flex items-center justify-center rounded-lg rounded-bl-none text-sm shadow-inner">
                {company.rating.toFixed(1)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                No ratings yet
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="pt-3 border-t flex flex-row items-end justify-between mt-1">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                <Compass size={12} />
                <span>Tour Package</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Percent size={10} />
                <span>{taxPercentage}% tax incl.</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              {totalPriceWithTax > price && (
                <span className="text-xs text-muted-foreground line-through opacity-70 mb-0.5">
                  {formatCurrency(totalPriceWithTax)}
                </span>
              )}
              <span className="text-xl font-black text-foreground leading-none">
                {formatCurrency(price)}
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-1">
                Per Person
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <Card
      onClick={() => RouterPush(navigate, `/tours/services/${serviceId}`)}
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg cursor-pointer",
        isHorizontal
          ? "flex flex-row w-full min-h-[250px]"
          : "flex flex-col w-full h-full"
      )}
    >
      {/* Image Slider */}
      <div
        className={cn(
          "relative group/slider overflow-hidden",
          isHorizontal ? "w-[260px] xl:w-[280px] shrink-0 h-auto self-stretch" : "w-full h-[200px] sm:h-[210px] shrink-0"
        )}
      >
        <img
          src={slides[imgIdx]?.url || "/tours/tour.png"}
          alt={title}
          onClick={(e) => {
            e.stopPropagation();
            setOverlayOpen(true);
          }}
          className="h-full w-full object-cover transition-opacity duration-300 cursor-zoom-in"
        />
        {slides.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {getVisibleDots().map((dot) => (
                <span
                  key={dot.index}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    dot.isActive
                      ? "w-4 h-1.5 bg-white"
                      : dot.isSmall
                        ? "w-1 h-1 bg-white/30"
                        : "w-1.5 h-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
        {/* Duration badge */}
        {duration && (
          <div className="absolute left-3 top-3 bg-zinc-900/70 text-white backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 shadow-md border border-zinc-700/50">
            <Clock className="w-3.5 h-3.5" />
            {duration}
          </div>
        )}
      </div>
      {overlayOpen && <ImageOverlay slides={slides} initialIndex={imgIdx} onClose={() => setOverlayOpen(false)} />}

      {/* Content */}
      <CardContent
        className={cn(
          "p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3"
        )}
      >
        <div className={cn("flex gap-3", isHorizontal ? "flex-col md:flex-row justify-between" : "flex-col")}>
          {/* Info */}
          <div className="space-y-2 flex-1 min-w-0">
            <h3
              className={cn(
                "font-bold leading-snug cursor-pointer hover:text-primary transition-colors line-clamp-2",
                isHorizontal ? "text-xl" : "text-lg"
              )}
              onClick={() => RouterPush(navigate, `/tours/services/${serviceId}`)}
            >
              {title}
            </h3>

            {/* Company & Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  RouterPush(navigate, `/tours/${company?.companyId}`);
                }}
              >
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="font-medium truncate max-w-[150px]">{company?.name}</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="underline underline-offset-2 decoration-dotted truncate max-w-[120px]">
                  {company?.city}
                </span>
              </div>
            </div>

            {/* Destinations */}
            {destinations && destinations.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 shrink-0">
                  <Navigation className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground line-clamp-1 truncate">
                  {destinations.join(" → ")}
                </span>
              </div>
            )}

            {/* Rating row */}
            {company?.rating && company.rating > 0 ? (
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <StarRating rating={company.rating} className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    {ratingLabel(company.rating)}
                  </span>
                </div>
                {!isHorizontal && (
                  <div className="bg-primary text-white font-bold h-8 w-8 flex items-center justify-center rounded-lg rounded-bl-none text-sm shadow-sm shrink-0">
                    {company.rating.toFixed(1)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-xs font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                  No ratings yet
                </span>
              </div>
            )}
          </div>

          {/* Rating badge on right for Horizontal mode */}
          {isHorizontal && company?.rating && company.rating > 0 && (
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="font-bold text-primary text-xs leading-none text-right">
                {ratingLabel(company.rating)}
              </p>
              <div className="bg-primary text-white font-bold h-10 w-10 flex items-center justify-center rounded-lg rounded-bl-none text-lg shadow-sm">
                {company.rating.toFixed(1)}
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="pt-3.5 border-t flex flex-row items-end justify-between mt-auto">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Compass size={13} className="text-primary shrink-0" />
              <span>Guided Tour</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <Percent size={11} className="shrink-0" />
              <span>{taxPercentage}% GST included</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            {totalPriceWithTax > price && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-green-100 border-none text-[10px] px-1.5 py-0 mb-0.5 font-bold">
                {Math.round(
                  ((totalPriceWithTax - price) / totalPriceWithTax) * 100
                )}
                % OFF
              </Badge>
            )}
            <div className="flex flex-col">
              {totalPriceWithTax > price && (
                <span className="text-xs text-muted-foreground line-through opacity-70 leading-none mb-0.5">
                  {formatCurrency(totalPriceWithTax)}
                </span>
              )}
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl sm:text-2xl font-black text-foreground leading-none">
                  {formatCurrency(price)}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  /person
                </span>
              </div>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold leading-none mt-1">
                Total: {formatCurrency(totalPriceWithTax)} incl. tax
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Skeleton ───────────────────────────────────────────────────────────────────

export const ToursCardSkeleton = ({ wrap }: { wrap?: boolean }) => {
  const isMobile = useIsMobile();
  const isHorizontal = !isMobile && !wrap;

  if (isMobile) {
    return (
      <Card className="group overflow-hidden rounded-xl border bg-card w-full shadow-md pt-0">
        <Skeleton className="w-full h-[180px] rounded-t-xl rounded-b-none" />
        <CardContent className="p-3.5 flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <Skeleton className="h-3.5 w-full" />
          </div>
          <div className="flex items-center justify-between pt-1 mt-2">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-3 w-3 rounded-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg rounded-bl-none" />
          </div>
          <div className="pt-3 border-t flex flex-row items-end justify-between mt-2">
            <div className="flex flex-col gap-1 w-20">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2.5 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card transition-all duration-300",
        isHorizontal
          ? "flex flex-row w-full min-h-[250px]"
          : "flex flex-col w-full min-h-[380px]"
      )}
    >
      <Skeleton
        className={cn(
          "shrink-0",
          isHorizontal
            ? "w-[260px] xl:w-[280px] h-full rounded-l-2xl rounded-r-none"
            : "w-full h-[200px] sm:h-[210px] rounded-t-2xl rounded-b-none"
        )}
      />
      <CardContent
        className={cn(
          "p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3"
        )}
      >
        <div className={cn("flex gap-3", isHorizontal ? "flex-col md:flex-row justify-between" : "flex-col")}>
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-[70%]" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col gap-3 mt-1">
              <Skeleton className="h-4 w-[85%]" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-3.5 w-3.5 rounded-full" />
                ))}
              </div>
              {!isHorizontal && <Skeleton className="h-8 w-8 rounded-lg rounded-bl-none" />}
            </div>
          </div>
          {isHorizontal && (
            <div className="flex flex-col gap-1.5 hidden md:flex items-end shrink-0">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-10 rounded-lg rounded-bl-none" />
            </div>
          )}
        </div>
        <div className="pt-3.5 border-t flex flex-row items-end justify-between mt-auto">
          <div className="space-y-1.5 w-28">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};