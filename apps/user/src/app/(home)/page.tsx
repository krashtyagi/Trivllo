
'use client'
import { cn } from "@/lib/utils";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from 'react-error-boundary'
import HotelFramePage from "@/components/frame-pages/HotelFramePage";
import type { CityTrends } from "@/types";
import { useGetNewHotels } from "@/services/hotel/querys";
import { PageSkeleton } from "@/components/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Categories } from "@/types";
import FilterBox from "@/components/filter-bar/fiter_box";
import { Hotel_Box_FilterBarValues, Search_box_values } from "@/constants/constants";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import SearchInput from "@/constants/search-box-components/search-input";
import { Calendar, MapPin, User } from "lucide-react";
import { useHotelStore } from "@/store/hotel.store";
import GuestSelector from "@/components/filter-bar/newui-selectedCounter";
import HotelCalendern from '@/components/navbar/filter-nav-bar/calander05'
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
    image: string;
    startingPrice?: number | null;
    rating?: number;
    numReviews?: number;
    amenities?: string[];
    images?: string[];
};
// export const  HotelPopularCites:CityTrends[]=[
//  {
//   name:"south goa",
//   tagline:"Popular homes in South Goa"
//  },
//  {
//   name:"Bangalore",
//   tagline:"Popular stays in Bangalore"
//  },
//  {
//   name:"south goa",
//   tagline:"Popular homes in South Goa"
//  },
//  {
//   name:"Bangalore",
//   tagline:"Popular stays in Bangalore"
//  },
//  {
//   name:"south goa",
//   tagline:"Popular homes in South Goa"
//  },
//  {
//   name:"Bangalore",
//   tagline:"Popular stays in Bangalore"
//  },
// ]
const Hotel = () => {
    const { city, setCity, setDate, date, guests } = useHotelStore();
    // const [city1, setCity1] = useState("")

    useEffect(() => {
        try {
            localStorage.removeItem("nextRoute");
            localStorage.removeItem("like");
        } catch {}
    }, []);
    const ismobile = useIsMobile();


    return (
        <div className={cn(" w-full ", ismobile ? "" : "")}>
            <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
                <Suspense fallback={<PageSkeleton />}>
                    <FilterBox city={city} date={date} guests={guests} FilterBoxValues={{

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
                                description: "450+ vacation rentals, 120 local guides, and endless memories.",
                                link: "/search-box-videos/sardaar.mp4"
                            },
                            {
                                title: "Classic Rooms.",
                                description: "Stay in comfort and style.",
                                link: "/search-box-videos/room.mp4"
                            },
                            // {
                            //     title: "Capture the Joy.",
                            //     description: "450+ vacation rentals, 120 local guides, and endless memories.",
                            //     link: "/search-box-videos/happy.mp4"
                            // },
                            // {
                            //     title: "The Open Road.",
                            //     description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
                            //     link: "/search-box-videos/road.mp4"
                            // },
                            // {
                            //     title: "Reach New Heights.",
                            //     description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
                            //     link: "/search-box-videos/hot-air.mp4"
                            // }
                        ]
                    }} type="home" link="/hotels"
                        directions={
                            <div className="w-full flex gap-2">
                                <div className="flex-1">
                                    <SearchInput Icon={MapPin} placeholder="Search Destination...." label="hotel" value={city} setCity={(e) => setCity(e)} />
                                </div>
                            </div>

                        } />

                    <div className={cn(CommonPagesStyles, "md:flex-col flex gap-2 md:gap-4 bg-background pt-1 pb-4 md:py-4")}>

                        <HotelFramePage
                            // popularTrends={HotelPopularCites}
                            type="hotels"




                        />
                    </div>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default Hotel;
