"use client";

import { cn } from "@/lib/utils";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import HotelFramePage from "@/components/frame-pages/HotelFramePage";
import type { Categories, CityTrends } from "@/types";
import { PageSkeleton } from "@/components/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { useIsMobile } from "@/hooks/use-mobile";
import FilterBox from "@/components/filter-bar/fiter_box";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import SearchInput from "@/constants/search-box-components/search-input";
import { Calendar, MapPin, User } from "lucide-react";
import { useHotelStore } from "@/store/hotel.store";
import GuestSelector from "@/components/filter-bar/newui-selectedCounter";
import HotelCalendern from "@/components/navbar/filter-nav-bar/calander05";

export type HotelFramePageProps = {
  className?: string;
  type: Categories;
  popularTrends?: CityTrends[];
};

export interface HotelData {
  data: hoteldata[];
}

export type hoteldata = {
  _id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  startingPrice?: number | null;
  rating?: number;
  numReviews?: number;
  amenities?: string[];
};

export default function HotelsClientPage({ className }: HotelFramePageProps) {
  const { city, setCity, date, guests } = useHotelStore();
  const ismobile = useIsMobile();

  useEffect(() => {
    localStorage.removeItem("nextRoute");
    localStorage.removeItem("like");
  }, []);

  return (
    <div className={cn(" w-full ", ismobile ? "" : "", className)}>
      <ErrorBoundary
        fallback={
          <MessageModal title="Error" description="Something went wrong" />
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          <FilterBox
            city={city}
            date={date}
            guests={guests}
            FilterBoxValues={{
              filterBlocks: [
                {
                  label: "Check-in - Check-out",
                  icon: Calendar,
                  element: <HotelCalendern hookname="hotels" />,
                  text: "Add dates",
                },
                {
                  label: "Guests",
                  icon: User,
                  element: <GuestSelector />,
                  text: "Add Guests",
                },
              ],
              videos: [
                {
                  title: "Capture the Joy.",
                  description:
                    "450+ vacation rentals, 120 local guides, and endless memories.",
                  link: "/search-box-videos/sardaar.mp4",
                },
                {
                  title: "Classic Rooms.",
                  description: "Stay in comfort and style.",
                  link: "/search-box-videos/room.mp4",
                },
                {
                  title: "Royal towns.",
                  description: "Stay in udaipur.",
                  link: "/search-box-videos/udaipur.mp4",
                },
                // {
                //   title: "The Open Road.",
                //   description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
                //   link: "/search-box-videos/room.mp4"
                // },
                // {
                //   title: "Reach New Heights.",
                //   description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
                //   link: "/search-box-videos/hot-air.mp4"
                // }
              ],
            }}
            type="home"
            link="/hotels"
            directions={
              <div className="w-full flex gap-2">
                <div className="flex-1">
                  <SearchInput
                    Icon={MapPin}
                    placeholder="Search Destination...."
                    label="hotel"
                    value={city}
                    setCity={(e) => setCity(e)}
                  />
                </div>
              </div>
            }
          />

          <div
            className={cn(
              CommonPagesStyles,
              " md:flex-col  flex gap-4  bg-background py-4  ",
            )}
          >
            <HotelFramePage type="hotels" />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
