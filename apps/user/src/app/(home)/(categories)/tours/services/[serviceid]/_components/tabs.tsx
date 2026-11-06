"use client";

import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  ChevronRight,
  Loader2,
  Compass,
  Clock,
  Shield,
  Check,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Decription } from "@/app/(home)/(categories)/_componentsRoot_categories/description";
import { LayoutGridDemo } from "@/app/(home)/(categories)/_componentsRoot_categories/imsges";
import AmenitiesValues from "@/app/(home)/(categories)/_componentsRoot_categories/amanities";
import HotelPolicies from "../../../[tourid]/_components/policies";
import ChangelogComponentPage from "@/app/(home)/(categories)/_componentsRoot_categories/timelinedemo";
import ReviewsMain from "@/app/(home)/(categories)/_componentsRoot_categories/reviews";
import { RouterPush } from "@/components/RouterPush";
import { useToursStore } from "@/store/tours.store";
import { TourServiceData } from "./HotelItems";

import { cn } from "@/lib/utils";

type TabKey = "overview" | "description" | "amenities" | "reviews";

export function TabsLine({
  values,
  data,
  isBookingMode,
  isAvailabilityLoading,
}: {
  values: { title: TabKey; id: number }[];
  data: TourServiceData;
  isBookingMode: boolean;
  isAvailabilityLoading: boolean;
}) {
  const companyId = data.company.companyId;
  if (!data) return null;

  const content: Record<TabKey, React.ReactNode> = {
    overview: <LayoutGridDemo images={data?.service?.images} />,
    description: (
      <Decription
        data={{
          name: data.company.name,
          description: data.company.description,
        }}
      />
    ),
    reviews: <ReviewsMain companyId={companyId} CompanyType="tour" />,
    amenities: <AmenitiesValues amenities={data.service.features} title="" />,
  };

  const tabItems = [
    { key: "overview", label: "Overview", id: "overview" },
    { key: "description", label: "Description", id: "description" },
    { key: "amenities", label: "Features", id: "amenities" },
    { key: "itenary", label: "Itinerary", id: "itenary" },
    { key: "reviews", label: "Reviews", id: "reviews" },
    { key: "policies", label: "Policies", id: "policies" },
    { key: "payment", label: "Book Now", id: "payment-card", highlight: true },
  ];

  const handleTabClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 120;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    const duration = 600;
    let start: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, offsetPosition);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <section id="overview" className="py-3">
          {content.overview}
        </section>
      </div>

      {/* Full-width sticky bar edge-to-edge */}
      <div className="sticky top-14 md:top-16 z-30 w-full bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-t border-border shadow-xs mb-8">
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10 h-12 md:h-14 flex items-center">
          <div className="flex gap-6 overflow-x-auto no-scrollbar items-center w-full">
            {tabItems.map((tab) => (
              <a
                key={tab.key}
                href={`#${tab.id}`}
                className={cn(
                  "capitalize whitespace-nowrap pb-2 text-sm font-semibold transition-all cursor-pointer",
                  tab.highlight
                    ? "text-primary hover:text-primary/90 font-bold border-b-2 border-primary"
                    : "border-b-2 border-transparent hover:border-orange-500 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-primary",
                )}
                onClick={(e) => handleTabClick(e, tab.id)}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 items-start mb-5">
          <main className="flex-1 w-full min-w-0 space-y-8 mb-4">
            <section id="description" className="scroll-mt-24 py-2 gap-2">
              <h3 className="text-base sm:text-lg font-bold mb-1.5 dark:text-zinc-400 text-zinc-800">
                Description
              </h3>
              {content.description}
            </section>

            <section
              id="amenities"
              className="scroll-mt-24 border-t md:pt-6 pt-4"
            >
              <h3 className="text-base sm:text-lg font-bold mb-1.5 dark:text-zinc-400 text-zinc-800">
                Features
              </h3>
              {content.amenities}
            </section>

            <section
              id="itenary"
              className="scroll-mt-24 border-t md:pt-6 pt-4 w-full"
            >
              <div className="mb-6 text-left">
                <h3 className="text-xl sm:text-2xl font-bold">Itinerary</h3>
              </div>
              <ChangelogComponentPage releses={data.service.itinerary ?? []} />
            </section>

            <section
              id="reviews"
              className="scroll-mt-24 py-5 border-t md:pt-6 pt-4"
            >
              {content.reviews}
            </section>

            <section
              id="policies"
              className="scroll-mt-24 border-t md:pt-6 pt-4"
            >
              <HotelPolicies id={companyId} />
            </section>
          </main>

          <aside
            id="payment-card"
            className="w-full lg:w-[380px] xl:w-[400px] flex-shrink-0 lg:sticky lg:top-24 pt-3 pb-8 scroll-mt-24"
          >
            <TourBookingCard data={data} />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Tour Booking Sidebar Card ────────────────────────────────────────────────
const TourBookingCard = ({ data }: { data?: TourServiceData }) => {
  const { date, guests, setGuests } = useToursStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const maxPeople = data?.service?.maxPeople || 20;
  const totalGuests = Math.max(1, guests.adults + guests.children);
  const basePrice = data?.service?.price || 0;
  const taxPercentage = data?.service?.taxPercentage || 0;
  const taxAmountPerPerson = Number(
    ((basePrice * taxPercentage) / 100).toFixed(2),
  );
  const pricePerPersonWithTax = basePrice + taxAmountPerPerson;

  const totalBasePrice = basePrice * totalGuests;
  const totalTaxAmount = Number(
    ((totalBasePrice * taxPercentage) / 100).toFixed(2),
  );
  const grandTotal = totalBasePrice + totalTaxAmount;

  return (
    <Card className="w-full lg:max-w-[400px] border border-slate-100 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-[24px] overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md transition-colors duration-300">
      <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-6">
        {/* TOP BADGE & TITLE */}
        <div className="space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Guided Tour
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-foreground leading-snug">
              {data?.service?.title || "Tour Package"}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>
                {data?.company?.name} • {data?.company?.city}
              </span>
              {data?.service?.duration && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    {data.service.duration}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/60">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Date Range
              </span>
              <span className="text-[11px] font-bold text-foreground truncate mt-0.5">
                {date?.from ? format(date.from, "dd/MM/yyyy") : "Start"} -{" "}
                {date?.to ? format(date.to, "dd/MM/yyyy") : "End"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Guests
                </span>
                <span className="text-[11px] font-bold text-foreground mt-0.5 truncate">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (guests.adults > 1) {
                    setGuests({ ...guests, adults: guests.adults - 1 });
                  } else if (guests.children > 0) {
                    setGuests({ ...guests, children: guests.children - 1 });
                  }
                }}
                disabled={totalGuests <= 1}
                className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-bold hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                -
              </button>
              <span className="text-xs font-bold w-4 text-center">
                {totalGuests}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (totalGuests < maxPeople) {
                    setGuests({ ...guests, adults: guests.adults + 1 });
                  }
                }}
                disabled={totalGuests >= maxPeople}
                className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-bold hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {data?.service?.maxPeople && (
          <p className="text-[11px] text-muted-foreground text-center font-medium -mt-2">
            Max tour capacity:{" "}
            <span className="font-bold text-foreground">
              {data.service.maxPeople} people
            </span>
          </p>
        )}

        {/* PRICE SUMMARY */}
        {/* PRICE SUMMARY */}
        {data?.service?.price !== undefined && (
          <div className="space-y-4 pt-2">
            <div className="text-sm font-bold text-foreground">
              Pricing Breakdown
            </div>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>
                  Without Tax Price for {totalGuests}{" "}
                  {totalGuests === 1 ? "person" : "persons"}
                </span>
                <span className="font-semibold text-foreground">
                  ₹{totalBasePrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax ({taxPercentage}%)</span>
                <span className="font-semibold text-foreground">
                  ₹{totalTaxAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* GRAND TOTAL BOX */}
            <div className="bg-gradient-to-br from-primary/5 to-amber-500/5 dark:from-primary/10 dark:to-transparent p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border border-primary/10 space-y-1">
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Total Payable ({totalGuests}{" "}
                {totalGuests === 1 ? "Guest" : "Guests"})
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg sm:text-2xl font-black text-primary">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Tax ({taxPercentage}%) included
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 sm:p-6 pt-1 sm:pt-2 flex flex-col gap-2 sm:gap-3">
        <Button
          disabled={loading}
          onClick={() => {
            if (!data) return;
            setLoading(true);
            const targetRoute = `/booknow/${data.service.serviceId}/${data.company.companyId}`;
            localStorage.setItem("nextRoute", targetRoute);
            RouterPush(
              router,
              targetRoute,
              {
                date: `${date?.from ? format(date.from, "dd/MM/yyyy") : "Add date"}-${date?.to ? format(date.to, "dd/MM/yyyy") : "Add date"}`,
                guests: `${totalGuests} Guests`,
                categories: "tours",
              },
            );
          }}
          className="w-full bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-extrabold h-10 sm:h-13 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Book Tour Package</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        {/* SECURITY & TRUST BADGES */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            Secure Payment
          </span>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-green-500" />
            Instant Confirmation
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
