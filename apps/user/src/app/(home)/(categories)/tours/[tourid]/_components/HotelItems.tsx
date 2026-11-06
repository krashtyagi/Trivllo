"use client";

import { IconShare, IconMapPin } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { StarRating } from "@/app/(home)/(categories)/_componentsRoot_categories/star-rating";
import { TabsLine } from "./tabs";
import { cn } from "@/lib/utils";

import { ShareModal } from "../../../_componentsRoot_categories/shareComponent";
import { ToursData } from "../_providers_context/TourDetailsContextProvider";
import { LikeIcon } from "@/services/dailyfunctions";

type HotelItemsProps = {
  data: ToursData;
  isBookingMode: boolean;
  loading: boolean;
};

const TourDetailsItems = ({
  data,
  isBookingMode,
  loading,
}: HotelItemsProps) => {
  // const { availabilityLoading } = useBikeDetailsContext();
  return (
    <div className="flex flex-col gap-6 w-full py-4 md:py-8">
      <div className="flex flex-col gap-4 px-4 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h1 className="text-md sm:text-xl md:text-2xl font-bold text-foreground/80 tracking-tight leading-tight break-words">
              {data?.company?.name}
            </h1>

            <div className="flex items-center gap-0.5">
              {data.company.rating > 0 ? (
                <>
                  <StarRating rating={data.company.rating} />
                  <span className="ml-2 text-xs font-bold text-muted-foreground">
                    {data.company.rating}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">
                  No ratings yet
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full border border-border bg-background shadow-sm active:scale-90 transition-transform">
              <LikeIcon
                _id={data?.company?.companyId}
                isFavourite={data.company.isFavorite}
                name={"card"}
                className={""}
                serviceType={"tour"}
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
            {data.company.city}
          </p>
        </div>
      </div>

      <div className="w-full border-t border-border mt-2">
        <TabsLine
          data={data}
          isBookingMode={isBookingMode}
          isAvailabilityLoading={false}
          values={[
            { title: "overview", id: 1 },
            { title: "rooms", id: 5 },
            { title: "amenities", id: 3 },
            // { title: "location", id: 4 },
            { title: "reviews", id: 6 },
          ]}
        />
      </div>
    </div>
  );
};

export default TourDetailsItems;
