
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHotelStore } from "@/store/hotel.store";
import { cn } from "@/lib/utils";
import { useSliderIfNotChooseDate } from "../_providers_context/SliderIfNotChooseDate";
import { motion } from "framer-motion";
import React, { useState, useCallback } from "react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  ChevronLeft,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { validimage } from "@/services/dailyfunctions";
import { RouterPush } from "@/components/RouterPush";
import { TourService } from "../_providers_context/TourDetailsContextProvider";
import { DetailsPageCardWrapperUI } from "../../../_componentsRoot_categories/CardWrapper";
import { optimizeCloudinaryUrl, IMAGE_PRESETS } from "@/lib/image-optimizer";

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
          <img
            src={optimizeCloudinaryUrl(slides[idx]?.url, IMAGE_PRESETS.detailZoomHighRes)}
            alt="Tour view"
            decoding="async"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} className={cn("h-2 rounded-full cursor-pointer transition-all", i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60")} />)}
          </div>
          <span className="absolute top-4 left-4 text-white/70 text-sm font-medium">{idx + 1} / {slides.length}</span>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export function TourDetailsCard({
  duration,
  features,
  price,
  serviceId,
  title,
  taxPercentage,
  thumbnail: t,
  thumbnails,
  totalPriceWithTax,
}: TourService) {
  const [loading, setLoading] = useState(false);
  const { date } = useHotelStore();
  const { handleClick } = useSliderIfNotChooseDate();

  const [imgIdx, setImgIdx] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const tUrl = typeof t === "string" ? t : (t as any)?.url;
  const slides: { url: string }[] = (thumbnails && thumbnails.length > 0
    ? thumbnails.map((s: any) => (typeof s === "string" ? { url: s } : { url: s?.url || "/tours/tour.png" }))
    : [{ url: tUrl || "/tours/tour.png" }]);

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

  // Logic helpers
  const bothDateSelected = !!date?.to && !!date?.from;
  const discountLabel = taxPercentage > 0 ? `${taxPercentage}% TAX INCL.` : "BEST PRICE";
  const router = useRouter();
  const thumbnail = tUrl || "/tours/tour.png";
  return (
    <DetailsPageCardWrapperUI>


      {/* IMAGE SECTION */}
      <div className="relative overflow-hidden h-42 md:h-auto group/slider min-h-[180px] bg-muted rounded-md">
        <img
          src={optimizeCloudinaryUrl(
            validimage(slides[imgIdx]?.url, "/tours/tour.png"),
            IMAGE_PRESETS.roomCardThumb
          )}
          alt={title}
          loading="lazy"
          decoding="async"
          onClick={(e) => {
            e.stopPropagation();
            setOverlayOpen(true);
          }}
          className="w-full h-full object-cover rounded-md cursor-zoom-in min-h-[180px]"
        />
        {slides.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity z-10"
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
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
          Tour Package
        </div>

        <div className="absolute top-5 right-5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
          {discountLabel}
        </div>
      </div>
      {overlayOpen && <ImageOverlay slides={slides} initialIndex={imgIdx} onClose={() => setOverlayOpen(false)} />}

      {/* INFO SECTION */}
      <div className="p-4 md:p-5 flex flex-col border-b md:border-b-0 md:border-r border-border/50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3
              onClick={() => RouterPush(router, `/tours/services/${serviceId}`)}
              className="text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight hover:text-primary transition-colors duration-300 cursor-pointer line-clamp-2"
            >
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">Rishikesh, Uttarakhand</span>
            </div>
          </div>

          <div className="text-right ml-2 shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[10px] md:text-xs font-bold text-primary">Excellent</span>
              <div className="bg-primary text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">4.9</div>
            </div>
            <span className="text-[9px] md:text-[10px] text-muted-foreground">Top Rated</span>
          </div>
        </div>

        {/* TOUR SPECS GRID */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground/70">Duration</span>
              <span className="text-xs md:text-sm font-semibold text-foreground">{duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 bg-muted rounded-lg">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground/70">Guidance</span>
              <span className="text-xs md:text-sm font-semibold text-foreground">Expert Led</span>
            </div>
          </div>
        </div>

        {/* FEATURES TAGS */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="text-[9px] md:text-[10px] font-bold bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-md border border-border/40 whitespace-nowrap"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* PRICING & ACTION */}
      <div className="bg-muted/10 p-4 md:p-5 flex flex-col justify-center items-center md:items-end">
        <div className="text-center md:text-right w-full mb-4">
          <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Starting from</p>
          <div className="flex items-baseline justify-center md:justify-end gap-1">
            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground">
              ₹{price.toLocaleString()}
            </span>
            <span className="text-xs md:text-sm font-medium text-muted-foreground">/person</span>
          </div>
          {totalPriceWithTax > price ? (
            <p className="text-[10px] md:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              ₹{totalPriceWithTax.toLocaleString()} incl. taxes ({taxPercentage}%)
            </p>
          ) : (
            <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium mt-1">
              {taxPercentage > 0 ? `+ ${taxPercentage}% taxes & fees` : "All taxes included"}
            </p>
          )}
        </div>

        <Button
          disabled={loading}
          onClick={() => { setLoading(true); RouterPush(router, `/tours/services/${serviceId}`) }}
          size="lg"
          className="w-full group/btn relative overflow-hidden rounded-xl font-bold h-10 md:h-12 shadow-md hover:shadow-primary/20"
        >
          <span className="relative z-10 flex items-center gap-2 text-xs md:text-sm">
            <CalendarDays className="w-4 h-4" />
            {bothDateSelected ? "Book Tour" : "Check Availability"}
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover/btn:translate-x-1" />
          </span>
        </Button>

        <p className="text-[9px] md:text-[10px] text-muted-foreground mt-2 md:mt-3 text-center w-full">
          *Includes stay, meals & activities
        </p>
      </div>
    </DetailsPageCardWrapperUI>

  );
}


