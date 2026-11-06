"use client";

import { IconShare, IconMapPin } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { StarRating } from "@/app/(home)/(categories)/_componentsRoot_categories/star-rating";
import { TabsLine } from "./tabs";
import { Hotel } from "@/types";
import { handleCopy, LikeIcon } from "@/services/dailyfunctions";
import { useHotelContext } from "../_providers_context/hotel-contextProvider";
import { ShareModal } from "../../../_componentsRoot_categories/shareComponent";
import { cn, formatAddress } from "@/lib/utils";

type HotelItemsProps = {
  hotel: Hotel;
  isBookingMode: boolean;
  loading: boolean;
};

const HotelItems = ({ hotel, isBookingMode, loading }: HotelItemsProps) => {
  const { availabilityLoading } = useHotelContext();
  return (
    <div className="flex flex-col gap-6 w-full py-4 md:py-8">
      <div className="flex flex-col gap-4 px-4 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h1 className="text-md sm:text-xl md:text-2xl font-bold text-foreground/80 tracking-tight leading-tight break-words">
              {hotel.name}
            </h1>

            <div className="flex items-center gap-0.5">
              <StarRating rating={hotel.rating} />
              {/* <span className="ml-2 text-xs font-bold text-muted-foreground">
                {hotel.rating}
              </span> */}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full border border-border bg-background shadow-sm active:scale-90 transition-transform">
              <LikeIcon
                _id={hotel._id}
                isFavourite={hotel.isFavorite}
                name={hotel.name}
                serviceType="hotel"
              />
            </div>

            {/* <button
              onClick={handleCopy}
              className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full border border-border bg-background shadow-sm active:scale-90 transition-transform"
              title="Share"
              >
              <IconShare size={20} className="text-muted-foreground" />
            </button> */}
            <ShareModal />
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <IconMapPin size={14} className="flex-shrink-0" />
          <p className="text-sm font-semibold underline underline-offset-2 decoration-muted/40">
            {(() => {
              const addressText = formatAddress(hotel.address);
              return addressText
                ? hotel.city &&
                  !addressText.toLowerCase().includes(hotel.city.toLowerCase())
                  ? `${addressText}, ${hotel.city}`
                  : addressText
                : hotel.city;
            })()}
          </p>
        </div>
      </div>

      <div className="w-full border-t border-border mt-2">
        <TabsLine
          hotel={hotel}
          isBookingMode={isBookingMode}
          isAvailabilityLoading={availabilityLoading}
          values={[
            { title: "overview", id: 1 },
            { title: "rooms", id: 5 },
            { title: "amenities", id: 3 },
            { title: "location", id: 4 },
            { title: "reviews", id: 6 },
          ]}
        />
      </div>
    </div>
  );
};

export default HotelItems;
