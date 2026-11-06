"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Heart,
  Wifi,
  Car,
  Coffee,
  Mountain,
  BellRing,
  Flame,
  Sprout,
  Compass,
  Waves,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Hotel,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { RouterPush } from "../RouterPush";
import { useHotelStore } from "@/store/hotel.store";
import { useToursStore } from "@/store/tours.store";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { userAccessToken } from "@/types/auth";
import { dotoggleLike } from "@/services/hotel/hotel.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { optimizeCloudinaryUrl, IMAGE_PRESETS } from "@/lib/image-optimizer";

export type Item = {
  id?: string;
  _id?: string;
  title: string;
  location?: string;
  image: string | StaticImageData;
  images?: string[];
  href: string;
  price?: number | null;
  rating?: number;
  numReviews?: number;
  amenities?: string[];
  isFavorite?: boolean;
};

type Props = {
  type: "cabs" | "adventures" | "tours" | "bikes" | "hotels";
  tagline?: string;
  city?: string;
  items: Item[];
  isLoading?: boolean;
  icon?: React.ReactNode;
  galleryCardHide?: boolean;
};

const renderAmenityIcon = (amenity: string) => {
  const norm = amenity.toLowerCase();
  if (norm.includes("wifi"))
    return <Wifi className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("park"))
    return <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("breakfast") || norm.includes("dining"))
    return <Coffee className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("mountain") || norm.includes("view"))
    return <Mountain className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("room_service") || norm.includes("room service"))
    return <BellRing className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("bonfire") || norm.includes("fire"))
    return <Flame className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("garden") || norm.includes("terrace"))
    return <Sprout className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("guide") || norm.includes("trek"))
    return <Compass className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("raft") || norm.includes("river") || norm.includes("water"))
    return <Waves className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (norm.includes("safety") || norm.includes("gear"))
    return (
      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    );
  return (
    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
  );
};

export const OnlyCarousel = ({
  type,
  tagline,
  city,
  items,
  isLoading,
  icon,
  galleryCardHide = false,
}: Props) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "350px 0px" });
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const { setCity: setHotelCity } = useHotelStore();
  const { setCity: setTourCity } = useToursStore();

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanLeft(scrollLeft > 5);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  }, []);

  const handleSeeAll = () => {
    const targetCity = city || (tagline ? tagline.split(" ").pop() || "Manali" : "Manali");
    const citySlug = encodeURIComponent(targetCity.trim().toLowerCase());
    if (type === "tours") {
      setTourCity(targetCity.trim().toLowerCase());
      RouterPush(router, `/tours/find?city=${citySlug}`);
    } else {
      setHotelCity(targetCity.trim().toLowerCase());
      RouterPush(router, `/hotels/find?city=${citySlug}`);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items, updateScrollButtons]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!isLoading && items.length === 0) return null;

  return (
    <div
      ref={sectionRef}
      className="relative group bg-transparent max-w-screen"
    >
      {/* Header row */}
      <div className="mb-2 sm:mb-3.5 flex items-center justify-between px-2 md:px-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground capitalize">
              {tagline ||
                (type === "tours" ? "Popular Tours" : "Popular Stays")}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal hidden sm:block">
            {type === "tours"
              ? "Handpicked adventures loved by travelers"
              : "Handpicked hotels loved by travelers"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={handleSeeAll}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/80 text-xs font-semibold text-foreground hover:bg-accent hover:border-emerald-700 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1 sm:gap-1.5">
            <CarouselButton
              onClick={() => scroll("left")}
              disabled={!canLeft}
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <CarouselButton
              onClick={() => scroll("right")}
              disabled={!canRight}
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Carousel items */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 md:gap-4 overflow-x-auto pb-3 sm:pb-5 snap-x snap-mandatory scrollbar-hide scroll-smooth pt-1 pr-3",
          isLoading && "pl-1",
        )}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[205px] sm:w-[245px] md:w-[265px] flex-none h-[280px] gap-2 flex flex-col rounded-2xl p-2 border border-border/50 bg-card"
            >
              <Skeleton className="aspect-[16/11] w-full rounded-xl" />
              <div className="space-y-2 px-1 flex flex-col mt-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : (
          <>
            {items.map((item, i) => (
              <Card
                key={`${item.title}-${i}`}
                item={item}
                type={type}
                onClick={() => RouterPush(router, item.href)}
              />
            ))}

            {!galleryCardHide && (
              <MoreStaysCard
                items={items}
                tagline={tagline}
                city={city}
                type={type}
                onClick={handleSeeAll}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CarouselButton = ({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "rounded-full border border-border bg-background p-2 sm:p-2.5 shadow-sm transition-all",
      "hover:bg-accent hover:text-accent-foreground cursor-pointer",
      "disabled:opacity-40 disabled:cursor-not-allowed",
    )}
  >
    {icon}
  </button>
);

const Card = React.memo(
  ({
    item,
    type,
    onClick,
  }: {
    item: Item;
    type?: string;
    onClick: () => void;
  }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const targetId =
      (
        item.id ||
        item._id ||
        (item.href ? item.href.split("/").pop() : "")
      )?.toString() || "";

    const checkIsLoggedIn = () => {
      if (typeof window === "undefined") return false;
      return Boolean(localStorage.getItem(userAccessToken));
    };

    const getInitialLiked = () => {
      if (
        typeof window !== "undefined" &&
        !localStorage.getItem(userAccessToken)
      ) {
        return false;
      }
      return Boolean(item.isFavorite);
    };

    const [isLiked, setIsLiked] = useState<boolean>(getInitialLiked);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      // Purge any legacy wishlist data from localStorage
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("trivllo_user_wishlist")
      ) {
        localStorage.removeItem("trivllo_user_wishlist");
      }

      const isLoggedIn = checkIsLoggedIn();
      if (!isLoggedIn) {
        setIsLiked(false);
      } else {
        setIsLiked(Boolean(item.isFavorite));
      }
    }, [item.isFavorite, targetId]);

    const syncCaches = (isFav: boolean) => {
      if (!targetId) return;

      // 1. TanStack cache for home screen hotels
      queryClient.setQueryData(["gethotels_home"], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((h: any) => {
            const hId = (h._id || h.id)?.toString();
            if (hId === targetId) {
              return {
                ...h,
                isFavorite: isFav,
                isFavourite: isFav,
              };
            }
            return h;
          }),
        };
      });

      // 2. TanStack cache for hotel details page
      queryClient.setQueryData(["hotel_details", targetId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data
            ? { ...oldData.data, isFavorite: isFav, isFavourite: isFav }
            : oldData.data,
          isFavorite: isFav,
          isFavourite: isFav,
        };
      });
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!targetId) return;

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(userAccessToken)
          : null;

      if (!token) {
        setIsLiked(false);
        toast.info("Please log in to save to your wishlist");
        RouterPush(router, "/login");
        return;
      }

      const newLiked = !isLiked;
      setIsLiked(newLiked);
      syncCaches(newLiked);

      try {
        setLoading(true);
        const res = await dotoggleLike(
          targetId,
          type === "tours" ? "tour" : "hotel",
        );
        const isFav =
          res?.isFavorite !== undefined
            ? res.isFavorite
            : res?.data?.isFavorite !== undefined
              ? res.data.isFavorite
              : newLiked;

        setIsLiked(isFav);
        syncCaches(isFav);
        toast.success(
          isFav ? `Saved ${item.title} to wishlist` : `Removed from wishlist`,
        );
      } catch {
        setIsLiked(!newLiked);
        syncCaches(!newLiked);
        toast.error("Failed to update wishlist");
      } finally {
        setLoading(false);
      }
    };

    const handlePrefetch = useCallback(() => {
      if (!targetId) return;

      if (type === "tours") {
        queryClient.prefetchQuery({
          queryKey: ["getTourDetails", targetId],
          queryFn: async () => {
            const { axiosApi } = await import("@/lib/axios");
            const res = await axiosApi.get(
              `/tour-services/company/${targetId}`,
            );
            return res.data;
          },
          staleTime: 5 * 60 * 1000,
        });
      } else {
        queryClient.prefetchQuery({
          queryKey: ["hotel_details", targetId],
          queryFn: async () => {
            const { getHotelDetails } =
              await import("@/services/hotel/hotel.service");
            return getHotelDetails(targetId);
          },
          staleTime: 5 * 60 * 1000,
        });
      }

      if (item.href) {
        router.prefetch(item.href);
      }
    }, [targetId, type, item.href, queryClient, router]);

    return (
      <div
        onClick={() => {
          handlePrefetch();
          onClick();
        }}
        // onMouseEnter={handlePrefetch}
        // onPointerDown={handlePrefetch}
        // onFocus={handlePrefetch}
        className="w-[205px] sm:w-[245px] md:w-[265px] flex-none snap-start cursor-pointer group/card flex flex-col rounded-2xl bg-card border border-border/70 hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 overflow-hidden"
      >
        {/* Image container */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
          {/* Rating Badge (top-left) */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
            <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            <span>
              {typeof item.rating === "number" && item.rating > 0
                ? item.rating.toFixed(1)
                : "0.0"}
            </span>
            <span className="text-white/70 font-normal">
              ({typeof item.numReviews === "number" ? item.numReviews : 0})
            </span>
          </div>

          {/* Wishlist Heart Button (top-right) */}
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={loading}
            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white transition-all shadow-md cursor-pointer active:scale-90"
            aria-label="Save to wishlist"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isLiked
                  ? "fill-red-500 text-red-500 stroke-red-500"
                  : "text-white",
              )}
            />
          </button>

          {/* Image */}
          <Image
            width={300}
            height={210}
            src={optimizeCloudinaryUrl(item.image, IMAGE_PRESETS.carouselCard)}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        </div>

        {/* Details Container */}
        <div className="p-3.5 flex flex-col gap-1 flex-1 justify-between">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold line-clamp-1 text-foreground group-hover/card:text-emerald-800 dark:group-hover/card:text-emerald-400 transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
            {item.price != null && item.price > 0 && (
              <p className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-400">
                ₹{item.price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  {type === "tours" ? "/ person" : "/ night"}
                </span>
              </p>
            )}
          </div>

          {/* Amenities Row */}
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2.5 text-[10.5px] text-muted-foreground flex-wrap">
            {(item.amenities && item.amenities.length > 0
              ? item.amenities
              : ["Free WiFi", "Free Parking", "Breakfast"]
            )
              .slice(0, 3)
              .map((amenity, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  {renderAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  },
);

Card.displayName = "Card";

export function MoreStaysCard({
  items,
  tagline,
  city: cardCity,
  type,
  onClick,
}: {
  items?: Item[];
  tagline?: string;
  city?: string;
  type?: string;
  onClick: () => void;
}) {
  const isTour = type === "tours";
  const city = cardCity || (tagline ? tagline.split(" ").pop() || "Manali" : "Manali");

  // Curated high-res photos matching Image 1 (alpine chalet, panoramic room, luxury dome, cozy lounge, twilight villa)
  const defaultHotelPhotos = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", // Alpine wooden lodge & pine forest (matching Image 1!)
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", // Modern suite interior with panoramic view
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Luxury pool with lounge deck
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Resort twilight & warm lighting
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80", // Mountain cabin bedroom
  ];

  const defaultTourPhotos = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", // High mountain peaks
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Forest river valley
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", // Starry alpine peaks
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80", // Scenic trek trail
    "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80", // Forest trail hike
  ];

  // Prepare 5 photos (real from items or curated defaults)
  const photos = useMemo(() => {
    const list: string[] = [];
    if (items && items.length > 0) {
      for (const it of items) {
        if (typeof it.image === "string" && it.image.startsWith("http")) {
          if (!list.includes(it.image)) list.push(it.image);
        } else if ((it.image as any)?.src) {
          list.push((it.image as any).src);
        }
        if (Array.isArray(it.images)) {
          for (const img of it.images) {
            if (
              typeof img === "string" &&
              img.startsWith("http") &&
              !list.includes(img)
            ) {
              list.push(img);
            }
          }
        }
        if (list.length >= 5) break;
      }
    }
    const defaults = isTour ? defaultTourPhotos : defaultHotelPhotos;
    for (const fallback of defaults) {
      if (list.length >= 5) break;
      if (!list.includes(fallback)) list.push(fallback);
    }
    return list.slice(0, 5).map((src, id) => ({ id: `stay-photo-${id}`, src }));
  }, [items, isTour]);

  // Order of slots: order[slotIndex] = photoIndex
  // Slot 0 is the Top / Showcase card, which dynamically drives the background image of the card!
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isPaused, setIsPaused] = useState(false);
  const [isSm, setIsSm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    setIsSm(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsSm(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Viewport intersection observer: only animate when visible on screen
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Automatic swapping animation: only when visible in viewport, not paused, and browser tab is active
  useEffect(() => {
    if (isPaused || !isInView) return;

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!timer) {
        timer = setInterval(() => {
          setOrder((prev) => [prev[1], prev[2], prev[3], prev[4], prev[0]]);
        }, 3400);
      }
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused, isInView]);

  // The Top image is the photo currently at Slot 0
  const topPhotoIndex = order[0] ?? 0;
  const activeBgPhoto =
    photos[topPhotoIndex]?.src ||
    (isTour ? defaultTourPhotos[0] : defaultHotelPhotos[0]);

  // Slot definitions matching Image 1:
  // Compact jumbled overlapping positions with organic rotations and layered z-indices
  const baseSlots = [
    // Slot 0 (Top right - active showcase card that mirrors the card background)
    { top: 0, left: 62, width: 66, height: 50, rotate: 3, zIndex: 10 },
    // Slot 1 (Middle left - tilted -4deg)
    { top: 26, left: 0, width: 68, height: 50, rotate: -4, zIndex: 20 },
    // Slot 2 (Middle right - tilted 2deg)
    { top: 52, left: 58, width: 68, height: 52, rotate: 2, zIndex: 30 },
    // Slot 3 (Bottom left - tilted 4deg)
    { top: 96, left: 4, width: 56, height: 44, rotate: 4, zIndex: 40 },
    // Slot 4 (Bottom right - tilted -3deg)
    { top: 100, left: 58, width: 62, height: 46, rotate: -3, zIndex: 50 },
  ];

  const scaleFactor = isSm ? 1.1 : 1;

  const handleSelectImage = (photoIdx: number) => {
    setOrder((prev) => {
      const currentPos = prev.indexOf(photoIdx);
      if (currentPos === 0) return prev;
      return [...prev.slice(currentPos), ...prev.slice(0, currentPos)];
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-[270px] sm:w-[305px] md:w-[325px] h-[280px] sm:h-[295px] md:h-[305px] flex-none snap-start cursor-pointer group/more rounded-2xl overflow-hidden relative border border-white/20 shadow-lg p-4 flex flex-col justify-between text-white select-none transition-all duration-300 hover:shadow-xl"
    >
      {/* Dynamic Background Image with Smooth Cross-fade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeBgPhoto}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={optimizeCloudinaryUrl(
                activeBgPhoto,
                IMAGE_PRESETS.cardBackground,
              )}
              alt="Stay background"
              fill
              loading="lazy"
              unoptimized
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Dark Scrims for text contrast and premium cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-start justify-between gap-2 pointer-events-none">
        {/* Left: Heading & Subtitle */}
        <div className="max-w-[130px] sm:max-w-[155px] pointer-events-auto">
          <h4 className="text-base sm:text-lg font-black text-white leading-[1.18] drop-shadow-md tracking-tight">
            <span>{isTour ? "More Tours" : "More Stays"}</span>
            <br />
            <span className="text-white/95">Await You</span>
          </h4>
          <p className="text-[11px] sm:text-xs text-white/85 line-clamp-2 mt-1 leading-snug drop-shadow">
            {isTour
              ? `Explore dozens of tours across ${city} and beyond.`
              : `Explore hundreds of hotels across ${city} and beyond.`}
          </p>
        </div>

        {/* Right: Badge matching Image 1 */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-white/60 pointer-events-auto">
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            {isTour ? (
              <Compass className="w-3.5 h-3.5 text-emerald-700 stroke-[2.2]" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.2]" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-black text-slate-900 tracking-tight">
              {isTour ? "80+" : "120+"}
            </span>
            <span className="text-[9px] font-semibold text-slate-600">
              {isTour ? "Tours" : "Hotels"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area: CTA Button */}
      <div className="relative z-10 flex items-end justify-between mt-auto pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="pointer-events-auto bg-white text-slate-900 hover:bg-slate-100 font-bold text-[11px] sm:text-xs px-3.5 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer group/btn shrink-0"
        >
          <span>{isTour ? "See All Tours" : "See All Hotels"}</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Jumbled Animated Cluster (Image 1 replica) */}
      <div
        className="absolute right-2 sm:right-3 bottom-2.5 sm:bottom-3 w-[130px] sm:w-[145px] h-[150px] sm:h-[165px] z-20 pointer-events-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {photos.map((photo, photoIdx) => {
          const currentSlotIndex = order.indexOf(photoIdx);
          const slot = baseSlots[currentSlotIndex];
          const isTop = currentSlotIndex === 0;

          return (
            <motion.div
              key={photo.id}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 22,
                mass: 0.85,
              }}
              animate={{
                top: Math.round(slot.top * scaleFactor),
                left: Math.round(slot.left * scaleFactor),
                width: Math.round(slot.width * scaleFactor),
                height: Math.round(slot.height * scaleFactor),
                rotate: slot.rotate,
                zIndex: slot.zIndex,
              }}
              className={cn(
                "absolute overflow-hidden rounded-xl border-[1.5px] border-white shadow-lg cursor-pointer group/thumb hover:brightness-105 transition-all duration-300",
                isTop
                  ? "ring-2 ring-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.45)] scale-[1.02]"
                  : "hover:scale-105 hover:z-[60]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectImage(photoIdx);
              }}
              title="Click to feature this stay"
            >
              <Image
                src={optimizeCloudinaryUrl(photo.src, IMAGE_PRESETS.miniThumb)}
                alt="Stay preview"
                fill
                loading="lazy"
                unoptimized
                className="object-cover"
                sizes="100px"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
