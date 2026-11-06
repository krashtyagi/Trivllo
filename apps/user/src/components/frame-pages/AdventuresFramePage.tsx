'use client'
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { PopularDestinationCarousel } from "../carousel/tabs-carousel";
import { ImagesSliderDemo } from "../addimage/middle-ads-image";
import { useGetNewHotels } from "@/services/hotel/querys";
import type { Item } from "../carousel/onlyColursel";
import { hoteldata, HotelFramePageProps } from "@/app/(home)/(categories)/hotels/page";
import FrameColursals from "./frame_coloursals";

// No tabs in this design → so we pass tabs={undefined}
type SectionConfig = {
    tagline: string;
    city: string;
    limit?: number;
};

const POPULAR_SECTIONS: SectionConfig[] = [
    { tagline: "Trending Adventures in Rishikesh", city: "Goa" },
    { tagline: "Popular Stays In Bangalore", city: "Bengaluru" },
    { tagline: "Grand Palaces In Udaipur", city: "Udaipur" },
    { tagline: "Luxury in Mumbai", city: "Mumbai" },
    { tagline: "Luxury in Indore", city: "Indore" },
];

const MainFramePage = ({ className, type, popularTrends }: HotelFramePageProps) => {
    const { data, isLoading, error } = useGetNewHotels();


    // 1. Group once (optional but efficient if many sections)
    const groupedByCity = useMemo(() => {
        if (!data?.data) return {};

        return data.data.reduce((acc: Record<string, hoteldata[]>, hotel: hoteldata) => {
            const city = hotel.city?.trim();
            if (!city) return acc;
            const key = city.toLowerCase();
            acc[key] = acc[key] || [];
            acc[key].push(hotel);
            return acc;
        }, {} as Record<string, hoteldata[]>);
    }, [data?.data]);
    // let allciti =
    // 2. Prepare carousel items for each section
    const sectionItems = useMemo(() => {
        return POPULAR_SECTIONS.map((section) => {
            const hotelsInCity = groupedByCity[section.city.toLowerCase()] || [];

            // Optional: sort by some criteria (e.g. newest first if _id is chronological)
            // hotelsInCity.sort((a, b) => b._id.localeCompare(a._id)); 

            const sliced = section.limit ? hotelsInCity.slice(0, section.limit) : hotelsInCity;

            return sliced.map((hotel: hoteldata): Item => ({
                title: hotel.name,
                location: `${hotel.city}, India`,
                image: hotel.image,
                href: `/hotels/${hotel._id}`,
            }));
        });
    }, [groupedByCity]);
    const activities: Item[] = [
        { title: "Paragliding", image: "/adventures/pg.png", href: "/adventures/find?category=paragliding" },
        { title: "Bungee jumping", image: "/adventures/bj.png", href: "/adventures/find?category=bungee" },
        { title: "Scuba diving", image: "/adventures/sud.png", href: "/adventures/find?category=diving" },
        { title: "Skydiving", image: "/adventures/sd.png", href: "/adventures/find?category=sky" },
        { title: "Rafting", image: "/adventures/rft.png", href: "/adventures/find?category=rafting" },
        { title: "Trekking", image: "/adventures/trk.png", href: "#" },
    ]
    return (
        <FrameColursals className={cn(className, " ")}>

            <PopularDestinationCarousel
                tagline={"Most Popular activitys"}
                tabs={undefined}
                type={"adventures"}
                items={activities}
                isLoading={isLoading}
            />
            {POPULAR_SECTIONS.map((section, i) => {
                const items = sectionItems[i] || [];


                return (
                    <React.Fragment key={section.tagline}>

                        <PopularDestinationCarousel
                            tagline={section.tagline}
                            tabs={popularTrends?.[0]?.tabs || undefined}
                            type={type}
                            items={items}
                            isLoading={isLoading}
                        />

                        {i === 1 && (
                            <div className="px-2 md:px-0">
                                <ImagesSliderDemo images={
                                    ['/adventures/ads1.jpg', '/adventures/ads2.jpg', '/adventures/ads3.jpg']
                                } title="Discover Asia" subtitle="Book now" description="Book your next adventure now" link="/adventures/find" />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {error && (
                <p className="text-red-500 text-center">Failed to load hotels: {error.message}</p>
            )}
        </FrameColursals>

    );
};

export default MainFramePage;