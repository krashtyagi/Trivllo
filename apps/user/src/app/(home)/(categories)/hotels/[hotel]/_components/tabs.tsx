"use client";

import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Hotel, RoomType } from "@/types";
import { useHotelStore } from "@/store/hotel.store";

import AmenitiesValues from "../../../_componentsRoot_categories/amanities";
import MapLocation from "@/components/Location";
import { formatAddress } from "@/lib/utils";
import ReviewsMain from "../../../_componentsRoot_categories/reviews";
import { HotelPolicies } from "./policies";
import { RoomsMain } from "./rooms";
import { HotelCalender } from "./calander-booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CounterWithoutQuery } from "@/components/side-bar-filter/counter";
import { PaymentProps } from "@/schema/payment.schema";
import { UseFormReturn } from "react-hook-form";
import {
  useHotelContext,
  useOptionalHotelContext,
} from "../_providers_context/hotel-contextProvider";
import SliderIfNotChooseDate from "../_providers_context/SliderIfNotChooseDate";
import GuestSelector from "@/components/filter-bar/newui-selectedCounter";
import { CometCard } from "@/components/ui/comet-card";
import { cn } from "@/lib/utils";
import { Decription } from "../../../_componentsRoot_categories/description";
import { LayoutGridDemo } from "../../../_componentsRoot_categories/imsges";
import { useTranslation } from "@/hooks/useTranslation";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type TabKey =
  | "overview"
  | "description"
  | "location"
  | "rooms"
  | "amenities"
  | "reviews";

export function TabsLine({
  values,
  hotel,
  isBookingMode,
  isAvailabilityLoading,
}: {
  values: { title: TabKey; id: number }[];
  hotel: Hotel;
  isBookingMode: boolean;
  isAvailabilityLoading: boolean;
}) {
  const { t } = useTranslation();
  const isNavHidden = useScrollDirection();

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const hotelId = hotel?._id;
  if (!hotel) return null;

  const content: Record<TabKey, React.ReactNode> = {
    overview: <LayoutGridDemo images={hotel.images} />,
    description: (
      <Decription
        data={{
          name: hotel.name,
          description: hotel.description,
          city: hotel.city,
          address: formatAddress(hotel.address),
        }}
      />
    ),
    location: (
      <MapLocation
        address={formatAddress(hotel.address) || hotel.city}
        cordinates={hotel.location.coordinates}
        map="/map.png"
      />
    ),
    amenities: (
      <AmenitiesValues
        amenities={hotel.amenities}
        hotelName={hotel.name}
        title={t("hotel.amenities")}
      />
    ),
    reviews: <ReviewsMain companyId={hotelId} CompanyType="hotel" />,
    rooms: (
      <RoomsMain
        hotelId={hotelId}
        isBookingMode={isBookingMode}
        isLoading={isAvailabilityLoading}
      />
    ),
  };

  const handleClick = () =>
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <section id="overview" className="py-3">
          {content.overview}
        </section>
      </div>

      {/* Full-width sticky bar edge-to-edge */}
      <div
        className={cn(
          "sticky z-30 w-full bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-t border-border shadow-xs mb-8 transition-all duration-300 ease-in-out",
          isNavHidden ? "top-0" : "top-14 md:top-16",
        )}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10 h-12 md:h-14 flex items-center">
          <div className="flex gap-6 overflow-x-auto no-scrollbar items-center w-full">
            {values.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.title}`}
                className="capitalize whitespace-nowrap pb-2 border-b-2 border-transparent hover:border-orange-500 text-sm font-semibold transition-all text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-primary cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(tab.title);
                  if (!target) return;

                  const headerOffset = isNavHidden ? 60 : 120;
                  const elementPosition = target.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;

                  // Custom smooth scroll that cannot be aborted by native browser layout shift bugs
                  const startPosition = window.pageYOffset;
                  const distance = offsetPosition - startPosition;
                  const duration = 600; // ms
                  let start: number | null = null;

                  const easeInOutQuad = (
                    t: number,
                    b: number,
                    c: number,
                    d: number,
                  ) => {
                    t /= d / 2;
                    if (t < 1) return (c / 2) * t * t + b;
                    t--;
                    return (-c / 2) * (t * (t - 2) - 1) + b;
                  };

                  const animation = (currentTime: number) => {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = easeInOutQuad(
                      timeElapsed,
                      startPosition,
                      distance,
                      duration,
                    );
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) {
                      requestAnimationFrame(animation);
                    } else {
                      window.scrollTo(0, offsetPosition);
                    }
                  };

                  requestAnimationFrame(animation);
                }}
              >
                {t(`hotel.${tab.title}`)}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:gap-6 mb-5">
          <main className="flex-1 min-w-0 space-y-3">
            <section id="description" className=" py-2 gap-2">
              <h3 className="text-base sm:text-lg font-bold capitalize mb-1.5 dark:text-zinc-400 text-zinc-800">
                {t("hotel.description")}
              </h3>
              {content.description}
            </section>
            <section
              id="amenities"
              className="scroll-mt-16 border-t md:pt-3 pt-2"
            >
              {content.amenities}
            </section>
            <section
              id="location"
              className="scroll-mt-5 border-t md:pt-4 pt-5 my-4"
              ref={sectionRef}
            >
              {content.location}
            </section>
          </main>
          <aside className="lg:w-[380px] flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              {/* <CometCard translateDepth={5}> */}
              <BookingCard
                isBookingMode={isBookingMode}
                isLoading={isAvailabilityLoading}
              />
              {/* </CometCard> */}
            </div>
          </aside>
        </div>
        <section
          id="rooms"
          className="scroll-mt-24 border-t md:pt-10 pt-6 md:mb-16 mb-5 w-full"
        >
          <SliderIfNotChooseDate handleClick={handleClick}>
            {content.rooms}
          </SliderIfNotChooseDate>
        </section>
        <section id="reviews" className="py-5 border-t md:pt-5 pt-6 md:mb- mb-5">
          {content.reviews}
        </section>
        <HotelPolicies id={hotelId} />
      </div>
    </div>
  );
}

function BookingCard({
  isBookingMode,
  isLoading,
}: {
  isBookingMode: boolean;
  isLoading: boolean;
}) {
  const rawDate = useHotelStore((s) => s.date);
  const guests = useHotelStore((s) => s.guests);
  const date = React.useMemo(() => {
    if (!rawDate) return undefined;
    return {
      from: rawDate.from ? new Date(rawDate.from) : undefined,
      to: rawDate.to ? new Date(rawDate.to) : undefined,
    };
  }, [rawDate]);

  const isInvalidDates = React.useMemo(() => {
    if (!date?.from || !date?.to) return true;
    return (
      date.from.getFullYear() === date.to.getFullYear() &&
      date.from.getMonth() === date.to.getMonth() &&
      date.from.getDate() === date.to.getDate()
    );
  }, [date]);

  const { t } = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { rooms, maxGuests, maxAdults, maxChildren, setFetch } =
    useHotelContext();

  useEffect(() => {
    if (showCalendar && !isInvalidDates) {
      setShowCalendar(false);
      setTimeout(() => {
        const btn = document.getElementById("show-rooms-btn");
        if (btn) {
          btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 150);
    }
  }, [isInvalidDates, showCalendar]);

  const validPrices = rooms
    .map((r: RoomType) => r.finalPrice || r.displayPrice || r.totalPrice)
    .filter((p): p is number => typeof p === "number" && !isNaN(p));

  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

  const handleToggleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalendar((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setShowCalendar(false);
    };
    if (showCalendar)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  return (
    <Card className="border border-border shadow-xl rounded-2xl bg-background/90 text-foreground overflow-visible relative">
      <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-6">
        <div
          ref={containerRef}
          className="relative rounded-xl sm:rounded-2xl border border-border divide-x divide-border flex overflow-visible bg-background z-1"
        >
          <div
            className="flex-1 p-2.5 sm:p-4 hover:bg-muted cursor-pointer transition rounded-l-xl sm:rounded-l-2xl"
            onClick={handleToggleCalendar}
          >
            <span className="text-[10px] uppercase font-black text-muted-foreground block mb-0.5 sm:mb-1">
              {t("hotel.checkIn")}
            </span>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {date?.from
                ? format(date.from, "dd/MM/yyyy")
                : t("hotel.addDate")}
            </p>
          </div>
          <div
            className="flex-1 p-2.5 sm:p-4 hover:bg-muted cursor-pointer transition rounded-r-xl sm:rounded-r-2xl"
            onClick={handleToggleCalendar}
          >
            <span className="text-[10px] uppercase font-black text-muted-foreground block mb-0.5 sm:mb-1">
              {t("hotel.checkOut")}
            </span>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {date?.to ? format(date.to, "dd/MM/yyyy") : t("hotel.addDate")}
            </p>
          </div>
          {showCalendar && (
            <div
              className={cn(
                "absolute p-2 z-[100px] bg-background border border-border shadow-2xl rounded-2xl",
                "top-full mt-2 left-1/2 -translate-x-1/2",
                " w-[98vw] md:w-auto",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <HotelCalender hookname="hotels" />
            </div>
          )}
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border p-0.5 sm:p-1 bg-background w-full">
          <VisitorsMembers
            showCalendar={false}
            maxLimit={maxGuests}
            maxAdults={maxAdults}
            maxChildren={maxChildren}
          />
        </div>
        <div className="py-1 sm:py-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase mb-0.5 sm:mb-1">
            {t("hotel.prices")}
          </p>
          {isLoading ? (
            <div className="animate-pulse h-6 sm:h-8 w-24 sm:w-32 bg-muted rounded" />
          ) : (
            <p className="text-base sm:text-2xl font-black text-foreground">
              {minPrice > 0
                ? `₹${minPrice} to ₹${maxPrice}`
                : t("hotel.selectDates")}
            </p>
          )}
        </div>
        <Button
          id="show-rooms-btn"
          disabled={isInvalidDates}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 sm:h-14 rounded-xl sm:rounded-2xl text-xs sm:text-lg shadow-md sm:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={async (e) => {
            e.preventDefault();
            setFetch(true);
            // Wait for DOM to settle after fetch triggers re-render
            requestAnimationFrame(() => {
              setTimeout(() => {
                const el = document.getElementById("rooms");
                if (el) {
                  const offset = 96; // matches scroll-mt-24 (24 * 4 = 96px)
                  const top =
                    el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }, 100);
            });
          }}
        >
          {t("hotel.showRooms")}
        </Button>
        <p className="text-[10px] sm:text-[11px] text-center text-muted-foreground font-medium italic">
          {t("hotel.bestPriceGuaranteed")}
        </p>
      </CardContent>
    </Card>
  );
}

export function VisitorsMembers({
  showCalendar,
  methods,
  maxLimit,
  maxAdults,
  maxChildren,
}: {
  showCalendar: boolean;
  methods?: UseFormReturn<PaymentProps>;
  maxLimit?: number;
  maxAdults?: number;
  maxChildren?: number;
}) {
  const { t } = useTranslation();
  const hotelCtx = useOptionalHotelContext();
  const effectiveMaxLimit = maxLimit ?? hotelCtx?.maxGuests;
  const effectiveMaxAdults = maxAdults ?? hotelCtx?.maxAdults;
  const effectiveMaxChildren = maxChildren ?? hotelCtx?.maxChildren;

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full px-2.5 sm:px-5"
      style={{ display: showCalendar ? "none" : "block" }}
    >
      <AccordionItem value="rooms and guests" className="border-b-0">
        <AccordionTrigger className="text-xs sm:text-sm font-semibold py-2.5 sm:py-4 hover:no-underline">
          {t("hotel.roomsAndGuests")}
        </AccordionTrigger>
        <AccordionContent>
          <GuestSelector
            maxLimit={effectiveMaxLimit}
            maxAdults={effectiveMaxAdults}
            maxChildren={effectiveMaxChildren}
            methods={methods}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const HotelVisitorsCounters = ({
  values,
  methods,
}: {
  values: string[];
  methods?: UseFormReturn<PaymentProps>;
}) => {
  const { guests, setGuests } = useHotelStore();
  const handleStoreChange = (key: string, val: number) =>
    setGuests({ ...guests, [key]: val });
  return (
    <div className="flex flex-col gap-2">
      {values.map((opt) => (
        <CounterWithoutQuery
          key={opt}
          label={opt}
          methods={methods}
          fieldName={methods ? `guests.${opt}` : undefined}
          value={methods ? undefined : (guests as Record<string, number>)[opt]}
          onChange={methods ? undefined : (val) => handleStoreChange(opt, val)}
        />
      ))}
    </div>
  );
};

export default BookingCard;
