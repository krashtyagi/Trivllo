// 'use client'
// import { cn } from "@/lib/utils";
// import React, { useMemo } from "react";
// import { PopularDestinationCarousel } from "../carousel/tabs-carousel";
// import { ImagesSliderDemo } from "../addimage/middle-ads-image";
// import { useGetNewHotels } from "@/services/hotel/querys";
// import type { Item } from "../carousel/onlyColursel";
// import { hoteldata, HotelFramePageProps } from "@/app/(home)/(categories)/hotels/page";

// // No tabs in this design → so we pass tabs={undefined}
// type SectionConfig = {
//     tagline: string;
//     city: string;
//     limit?: number;
// };

// const POPULAR_SECTIONS: SectionConfig[] = [
//     { tagline: "Trending Adventures in Rishikesh", city: "Goa" },
//     { tagline: "Popular Stays In Bangalore", city: "Bengaluru" },
//     { tagline: "Grand Palaces In Udaipur", city: "Udaipur" },
//     { tagline: "Luxury in Mumbai", city: "Mumbai" },
//     { tagline: "Luxury in Indore", city: "Indore" },
// ];

// const MainFramePage = ({ className, type, popularTrends }: HotelFramePageProps) => {
//     const { data, isLoading, error } = useGetNewHotels();


//     // 1. Group once (optional but efficient if many sections)
//     const groupedByCity = useMemo(() => {
//         if (!data?.data) return {};

//         return data.data.reduce((acc: Record<string, hoteldata[]>, hotel: hoteldata) => {
//             const city = hotel.city?.trim();
//             if (!city) return acc;
//             acc[city] = acc[city] || [];
//             acc[city].push(hotel);
//             return acc;
//         }, {} as Record<string, hoteldata[]>);
//     }, [data?.data]);
//     // let allciti =
//     // 2. Prepare carousel items for each section
//     const sectionItems = useMemo(() => {
//         return POPULAR_SECTIONS.map((section) => {
//             const hotelsInCity = groupedByCity[section.city] || [];

//             // Optional: sort by some criteria (e.g. newest first if _id is chronological)
//             // hotelsInCity.sort((a, b) => b._id.localeCompare(a._id)); 

//             const sliced = section.limit ? hotelsInCity.slice(0, section.limit) : hotelsInCity;

//             return sliced.map((hotel: hoteldata): Item => ({
//                 title: hotel.name,
//                 location: `${hotel.city}, India`,
//                 image: hotel.image,
//                 href: `/hotels/${hotel._id}`,
//             }));
//         });
//     }, [groupedByCity]);

//     return (
//         <div className={cn(className, "flex flex-col gap-y-2 md:gap-y-4 ")}>
//             <PopularDestinationCarousel
//                 tagline={"Most Popular activitys"}
//                 tabs={undefined}
//                 type={"adventures"}
//                 items={sectionItems[1]}
//                 isLoading={isLoading}
//             />
//             {POPULAR_SECTIONS.map((section, i) => {
//                 const items = sectionItems[i] || [];


//                 return (
//                     <React.Fragment key={section.tagline}>

//                         <PopularDestinationCarousel
//                             tagline={section.tagline}
//                             tabs={popularTrends?.[0]?.tabs || undefined}
//                             type={type}
//                             items={items}
//                             isLoading={isLoading}
//                         />

//                         {i === 1 && (
//                             <div className="px-2 md:px-0">
//                                 <ImagesSliderDemo images={
//                                     ['/adventures/ads1.jpg', '/adventures/ads2.jpg', '/adventures/ads3.jpg']
//                                 } title="Discover Asia" subtitle="Book now" description="Book your next adventure now" link="/adventures/find" />
//                             </div>
//                         )}
//                     </React.Fragment>
//                 );
//             })}

//             {error && (
//                 <p className="text-red-500 text-center">Failed to load hotels: {error.message}</p>
//             )}
//         </div>
//     );
// };

// export default MainFramePage;


'use client'
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { CarouselProps, PopularDestinationCarousel } from "../carousel/tabs-carousel";
import { ImagesSliderDemo } from "../addimage/middle-ads-image";
import { useGetNewHotels } from "@/services/hotel/querys";
import type { Item } from "../carousel/onlyColursel";
import { hoteldata, HotelFramePageProps } from "@/app/(home)/(categories)/hotels/page";
import { MapPin } from "lucide-react";
import FrameColursals from "./frame_coloursals";
export const DummyDataList: CarouselProps[] = [
    {
        type: "hotels",
        tagline: "Sponsored Results",
        tabs: undefined,
        items: [{
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        },],
        isLoading: false,
    },
    {
        type: "hotels",
        tagline: "Top 10 companies in Rishikesh",
        tabs: undefined,
        items: [{
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        },],
        isLoading: false,
    },
    {
        type: "hotels",
        tagline: "Organic Ranks",
        tabs: undefined,
        items: [{
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Secure Path",
            image: "/bikes/cc1.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Omni Point",
            image: "/bikes/cc2.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Global Track",
            image: "/bikes/cc3.png",
            location: "Staring From Rupees 600/D",
            href: "",
        }, {
            title: "Trace Tech System",
            image: "/bikes/cc4.png",
            location: "Staring From Rupees 600/D",
            href: "",
        },],
        isLoading: false,
    },
]
// No tabs in this design → so we pass tabs={undefined}
type SectionConfig = {
    tagline: string;
    city: string;
    limit?: number;
};

const POPULAR_SECTIONS: SectionConfig[] = [
    { tagline: "Sponsored Results", city: "" },
    { tagline: "Organic Ranks", city: "" },
    { tagline: "Top 10 companies in Rishikesh", city: "" },

];

const MainFramePage = ({ className, type, popularTrends }: HotelFramePageProps) => {



    return (
        <FrameColursals className={cn(className, " ")}>
            {POPULAR_SECTIONS.map((section, i) => {
                // const items = sectionItems[i] || [];


                return (
                    <React.Fragment key={section.tagline}>
                        <PopularDestinationCarousel
                            tagline={DummyDataList[i].tagline}
                            // tabs={popularTrends?.[0]?.tabs || undefined}
                            type={DummyDataList[i].type}
                            items={DummyDataList[i].items}
                            icon={<MapPin className="h-3 w-3 shrink-0" />}
                        // isLoading={isLoading}
                        />

                        {i === 1 && (
                            <div className="px-2 md:px-0">
                                <ImagesSliderDemo images={[
                                    '/hotels/img5.png',
                                    '/hotels/img6.png',
                                    '/hotels/img7.png',
                                    '/hotels/img8.png',
                                ]} title="Discover Asia" subtitle="Book now" description="Book your next adventure now" link="/hotels/find" />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {/* {error && (
                <p className="text-red-500 text-center">Failed to load hotels: {error.message}</p>
            )} */}
        </FrameColursals>
    );
};

export default MainFramePage;