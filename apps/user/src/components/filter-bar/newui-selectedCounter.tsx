"use client";

import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotelStore } from "@/store/hotel.store";
import { useBikesStore } from "@/store/bikes.store";
import { useCabsStore } from "@/store/cabs.store";
import { useToursStore } from "@/store/tours.store";
import { useAdventureStore } from "@/store/adventure.store";
import { usePathname } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { PaymentProps } from "@/schema/payment.schema";

type GuestType = "adults" | "children";

export default function GuestSelector({
  maxLimit,
  maxAdults,
  maxChildren,
  methods,
}: {
  maxLimit?: number;
  maxAdults?: number;
  maxChildren?: number;
  methods?: UseFormReturn<PaymentProps>;
} = {}) {
  const hotelStore = useHotelStore();
  const bikesStore = useBikesStore();
  const cabsStore = useCabsStore();
  const toursStore = useToursStore();
  const adventureStore = useAdventureStore();

  const pathname = usePathname();

  const activeCategory = (() => {
    if (pathname?.includes("/hotels")) return "hotels";
    if (pathname?.includes("/bikes")) return "bikes";
    if (pathname?.includes("/cabs")) return "cabs";
    if (pathname?.includes("/tours")) return "tours";
    if (pathname?.includes("/adventures")) return "adventures";
    return "hotels";
  })();

  const activeStore = {
    hotels: hotelStore,
    bikes: bikesStore,
    cabs: cabsStore,
    tours: toursStore,
    adventures: adventureStore,
  }[activeCategory];

  const guests = methods
    ? {
        adults: methods.watch("guests.adults") ?? 1,
        children: methods.watch("guests.children") ?? 0,
      }
    : activeStore?.guests || { adults: 1, children: 0 };

  const setGuests = (newGuests: { adults: number; children: number }) => {
    if (methods) {
      methods.setValue("guests.adults", newGuests.adults);
      methods.setValue("guests.children", newGuests.children);
    }
    if (activeStore?.setGuests) {
      activeStore.setGuests(newGuests);
    }
  };

  const totalGuests = (guests.adults || 0) + (guests.children || 0);

  // Auto-clamp guests down if exceeding maxLimit (e.g. if user previously selected 8 on search bar)
  useEffect(() => {
    if (maxLimit && maxLimit > 0) {
      const currentTotal = (guests.adults || 0) + (guests.children || 0);
      if (currentTotal > maxLimit) {
        let newAdults = Math.min(guests.adults || 1, maxLimit);
        if (newAdults < 1) newAdults = 1;
        let newChildren = Math.min(
          guests.children || 0,
          Math.max(0, maxLimit - newAdults)
        );
        setGuests({ adults: newAdults, children: newChildren });
      }
    }
  }, [maxLimit]);

  const isIncDisabled = (type: GuestType) => {
    if (maxLimit && totalGuests >= maxLimit) return true;
    if (type === "adults" && maxAdults && (guests.adults || 0) >= maxAdults)
      return true;
    if (
      type === "children" &&
      maxChildren !== undefined &&
      (guests.children || 0) >= maxChildren
    )
      return true;
    return false;
  };

  const handleChange = (type: GuestType, operation: "inc" | "dec") => {
    const value = guests[type] || 0;
    if (operation === "dec") {
      if (value === 0) return;
      if (type === "adults" && value === 1) return;
      setGuests({
        ...guests,
        [type]: value - 1,
      });
      return;
    }

    if (operation === "inc") {
      if (isIncDisabled(type)) return;
      setGuests({
        ...guests,
        [type]: value + 1,
      });
    }
  };

  const Row = ({
    title,
    subtitle,
    type,
  }: {
    title: string;
    subtitle?: string;
    type: GuestType;
  }) => (
    /* Reduced vertical padding on mobile (py-3 vs py-4) */
    <div className="flex items-center justify-between py-3 md:py-4 px-1">
      <div className="flex flex-col">
        {/* Shrunk text size for mobile (text-sm vs text-base) */}
        <p className="text-sm md:text-base font-semibold text-foreground leading-tight">
          {title}
        </p>
        {subtitle && (
          /* Shrunk subtitle text for mobile */
          <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5 leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => handleChange(type, "dec")}
          disabled={
            guests[type] === 0 || (type === "adults" && guests.adults === 1)
          }
          /* Shrunk button size for mobile (h-7 vs h-9) */
          className={cn(
            "flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full border border-border transition active:scale-95",
            guests[type] === 0 || (type === "adults" && guests.adults === 1)
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Shrunk count text for mobile */}
        <span className="w-4 md:w-5 text-center text-sm md:text-base font-medium text-foreground tabular-nums">
          {guests[type]}
        </span>

        <button
          type="button"
          onClick={() => handleChange(type, "inc")}
          disabled={isIncDisabled(type)}
          className={cn(
            "flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full border border-border transition active:scale-95",
            isIncDisabled(type)
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );

  return (
    /* Added a bit of responsive padding to the container */
    <div className="w-full max-w-md mx-auto rounded-2xl bg-background p-1 md:p-0">
      <Row title="Adults" subtitle="Ages 13 or above" type="adults" />
      <div className="border-t border-border" />
      <Row title="Children" subtitle="Ages 2–12" type="children" />
    </div>
  );
}