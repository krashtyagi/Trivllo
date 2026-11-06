"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabscn";
import { HotelRoomCard } from "./room-card";
import { RoomType } from "@/types";
import { useHotelContext } from "../_providers_context/hotel-contextProvider";
import { useHotelStore } from "@/store/hotel.store";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const RoomsMain = ({
  hotelId,
  isBookingMode,
  isLoading,
}: {
  hotelId: string;
  isBookingMode: boolean;
  isLoading: boolean;
}) => {
  const { rooms } = useHotelContext();

  return (
    <div className="w-full space-y-6">
      <div
        className={cn(
          "transition-all duration-300",
          isLoading &&
            isBookingMode &&
            "opacity-50 blur-[2px] pointer-events-none",
        )}
      >
        <RoomsBedTabs
          roomTypes={rooms}
          hotelId={hotelId}
          isBookingMode={isBookingMode}
        />
      </div>
    </div>
  );
};

export function RoomsBedTabs({
  roomTypes,
  hotelId,
  isBookingMode,
}: {
  roomTypes: RoomType[];
  hotelId: string;
  isBookingMode: boolean;
}) {
  const { t } = useTranslation();

  if (roomTypes?.length === 0) {
    return (
      <div className="p-10 border-2 border-dashed rounded-3xl text-center">
        <p className="text-slate-500 font-medium">
          No rooms available for the selected criteria.
        </p>
      </div>
    );
  }

  // Generate dynamic tabs based on bed counts
  const bedCounts = Array.from(
    new Set(
      roomTypes?.map((r) =>
        r.beds.reduce((acc, curr) => acc + curr.quantity, 0),
      ),
    ),
  ).sort((a, b) => a - b);

  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Full-width header banner: no radius curves, fills wide up to screen, dissolves seamlessly at the bottom */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden pb-8 pt-2 sm:pt-4 mb-6 min-h-[170px] sm:min-h-[190px]">
        {/* Wide scenic image: crisp and sharp, fading gently only at the bottom and left edges */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 lg:w-[72%] pointer-events-none select-none overflow-hidden">
          <img
            src="/hotels/rooms_header_bg.jpg"
            alt="Scenic hotel bedroom view"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-right sm:object-center brightness-[0.85] md:brightness-100"
          />
          {/* Mobile dark scrim overlay so text is clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-transparent md:hidden" />

          {/* Smooth fade at the bottom: only lower 35% fades into background so no horizon is visible */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* Smooth fade on the left side to protect text readability on desktop */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-2/5 sm:w-1/3 bg-gradient-to-r from-background via-background/60 to-transparent" />

          <div className="hidden sm:block absolute bottom-5 right-8 md:right-16 z-10">
            <span className="font-cursive text-xl sm:text-2xl text-slate-700/80 dark:text-zinc-200/80 drop-shadow-sm select-none">
              Serenity awaits you ♡
            </span>
          </div>
        </div>

        {/* Content container aligned with max-w-screen-2xl grid */}
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10 flex flex-col justify-between">
          <div className="max-w-xl flex flex-col gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md md:bg-primary/10 md:text-primary md:border-transparent w-fit text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comfort & Suites</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-foreground drop-shadow-sm">
                {t("hotel.availableRooms")}
              </h3>
              <p className="text-sm sm:text-base text-white/90 md:text-muted-foreground mt-0.5 drop-shadow-sm font-medium">
                {t("hotel.chooseBestRoom")}
              </p>
            </div>

            {/* Filter Bed Tabs */}
            <div className="pt-2">
              <TabsList className="bg-transparent gap-2 overflow-x-auto no-scrollbar flex justify-start h-auto p-0">
                <TabsTrigger
                  value="all"
                  className="rounded-full px-5 py-2 border border-white/30 md:border-slate-200 dark:border-zinc-700 bg-white/95 md:bg-background/90 text-slate-900 md:text-foreground backdrop-blur-sm data-[state=active]:bg-white md:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 md:data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all font-medium text-sm shadow-sm"
                >
                  All Rooms
                </TabsTrigger>
                {bedCounts.map((count) => (
                  <TabsTrigger
                    key={count}
                    value={count.toString()}
                    className="rounded-full px-5 py-2 border border-white/30 md:border-slate-200 dark:border-zinc-700 bg-black/40 md:bg-background/90 text-white md:text-foreground backdrop-blur-sm data-[state=active]:bg-white md:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 md:data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all font-medium text-sm shadow-sm"
                  >
                    {count} Bed{count > 1 ? "s" : ""}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <TabsContent value="all" className="flex flex-col gap-6">
        {roomTypes?.map((room) => (
          <RoomCardItem
            key={room._id}
            room={room}
            hotelId={hotelId}
            isBookingMode={isBookingMode}
          />
        ))}
      </TabsContent>

      {bedCounts.map((count) => (
        <TabsContent
          key={count}
          value={count.toString()}
          className="flex flex-col gap-6"
        >
          {roomTypes
            ?.filter(
              (r) =>
                r.beds.reduce((acc, curr) => acc + curr.quantity, 0) === count,
            )
            .map((room) => (
              <RoomCardItem
                key={room._id}
                room={room}
                hotelId={hotelId}
                isBookingMode={isBookingMode}
              />
            ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// function renderRoomCard(room: any, hotelId: string, isBookingMode: boolean) {
//   const totalBeds = room.beds.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
//   const bedDescription = room.beds.map((b: any) => `${b.quantity} ${b.type}`).join(", ");

//   // Price Calculation logic
//   const originalPrice = room.basePrice;
//   const discountedPrice = room.discountPrice || room.basePrice;
//   const discountPercent = originalPrice > discountedPrice
//     ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
//     : 0;

//   return (
//     <HotelRoomCard
//       key={room._id}
//       hotelId={hotelId}
//       id={room._id}
//       title={room.name}
//       imageUrl={room.images?.[0]?.url || "/img1.png"}
//       originalPrice={originalPrice}
//       discountedPrice={discountedPrice}
//       totalPrice={room.totalPrice}
//       nights={room.nights || 1}
//       rating={room.rating || 5.0}
//       reviewCount={room.numReviews || 120}
//       beds={`${totalBeds} ${totalBeds > 1 ? 'Beds' : 'Bed'} (${bedDescription})`}
//       guests={room.capacity.adults + room.capacity.children}
//       size={room.roomSizeSqm}
//       amenities={room.amenities.map((a: string) => ({
//         name: a,
//         icon: a.toLowerCase().replace(/\s+/g, "_"),
//       }))}
//       roomsLeft={room.availableRooms ?? room.totalRooms}
//       discountPercent={discountPercent}
//       isBookingMode={isBookingMode}
//     />
//   );
// }

export const RoomCardItem = ({
  room,
  hotelId,
  isBookingMode,
}: {
  room: RoomType;
  hotelId: string;
  isBookingMode: boolean;
}) => {
  const { date: d } = useHotelStore();
  const { isStale } = useHotelContext();
  const showReserveButton = !!d?.to && !!d?.from && !isStale;
  const totalBeds = room.beds.reduce(
    (acc: number, curr: { quantity: number }) => acc + curr.quantity,
    0,
  );
  const bedDescription = room.beds
    .map((b: { quantity: number; type: string }) => `${b.quantity} ${b.type}`)
    .join(", ");

  const currentNightlyPrice =
    isBookingMode && room.displayPrice
      ? room.displayPrice
      : room.discountPrice || room.basePrice;

  const originalPrice = room.basePrice;

  // Discount % calculation based on dynamic price
  const discountPercent =
    originalPrice > currentNightlyPrice
      ? Math.round(
          ((originalPrice - currentNightlyPrice) / originalPrice) * 100,
        )
      : 0;

  return (
    <HotelRoomCard
      displayPrice={room.displayPrice || room.basePrice}
      taxPercentage={room.taxPercentage}
      totalTax={room.totalTax}
      totalPriceWithTax={room.totalPriceWithTax}
      isStale={isStale}
      showReserveButton={showReserveButton}
      key={room._id}
      hotelId={hotelId}
      id={room._id}
      title={room.name}
      imageUrl={
        typeof room.images?.[0] === "string"
          ? room.images[0]
          : (room.images?.[0] as any)?.url || "/hotels/img1.png"
      }
      roomImages={room.images}
      originalPrice={originalPrice}
      discountedPrice={currentNightlyPrice}
      totalPrice={room.totalPrice}
      nights={room.nights || 1}
      rating={room.rating || 0}
      reviewCount={room.numReviews || 0}
      beds={`${totalBeds} ${totalBeds > 1 ? "Beds" : "Bed"} (${bedDescription})`}
      guests={(room.capacity?.adults || 0) + (room.capacity?.children || 0)}
      size={room.roomSizeSqm}
      amenities={room.amenities.map((a: string) => ({
        name: a,
        icon: a.toLowerCase().replace(/\s+/g, "_"),
      }))}
      roomsLeft={
        room.availableRooms !== undefined
          ? room.availableRooms
          : room.totalRooms
      }
      discountPercent={discountPercent}
      isBookingMode={isBookingMode}
    />
  );
};
