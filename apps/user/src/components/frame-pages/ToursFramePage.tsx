"use client";
import { cn } from "@/lib/utils";
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  CarouselProps,
  PopularDestinationCarousel,
} from "../carousel/tabs-carousel";
import type { Item } from "../carousel/onlyColursel";
import { HotelFramePageProps } from "@/app/(home)/(categories)/hotels/page";
import {
  MapPin,
  Compass,
  Mountain,
  Waves,
  Trees,
  Tent,
  ShieldCheck,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";
import FrameColursals from "./frame_coloursals";
import { useGetTourCompanies } from "@/services/tours/tours.queries";
import { TourCompanyItem } from "@/services/tours/tours.service";
import RankedBanner from "../addimage/RankedBanner";

// Curated dummy tour carousels to maintain 3-carousel gap between banners
export const DummyTourDataList: CarouselProps[] = [
  {
    type: "tours",
    tagline: "Top Tour Companies in Rishikesh",
    tabs: undefined,
    items: [
      {
        title: "Ganga Valley Adventure",
        image: "/adventures/rft.png",
        location: "Rishikesh • Starting ₹899/person",
        href: "/tours",
      },
      {
        title: "Himalayan River Runners",
        image: "/adventures/act1.png",
        location: "Rishikesh • Starting ₹1,499/person",
        href: "/tours",
      },
      {
        title: "Red Chilli Adventure",
        image: "/adventures/act2.png",
        location: "Rishikesh • Starting ₹1,200/person",
        href: "/tours",
      },
      {
        title: "White World Expeditions",
        image: "/adventures/act3.png",
        location: "Rishikesh • Starting ₹950/person",
        href: "/tours",
      },
      {
        title: "Camp Aqua Forest",
        image: "/adventures/act4.png",
        location: "Rishikesh • Starting ₹1,800/person",
        href: "/tours",
      },
      {
        title: "Jumpin Heights Rafting",
        image: "/adventures/bj.png",
        location: "Rishikesh • Starting ₹3,550/person",
        href: "/tours",
      },
      {
        title: "Paddle India Tours",
        image: "/adventures/rft.png",
        location: "Rishikesh • Starting ₹750/person",
        href: "/tours",
      },
      {
        title: "Garhwal Himalayan Tours",
        image: "/adventures/trk.png",
        location: "Rishikesh • Starting ₹2,100/person",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Himalayan Trekking & Expedition Specialists",
    tabs: undefined,
    items: [
      {
        title: "Indiahikes Adventure",
        image: "/adventures/trk.png",
        location: "Uttarakhand & HP • Starting ₹7,500",
        href: "/tours",
      },
      {
        title: "Trek The Himalayas",
        image: "/adventures/act1.png",
        location: "Manali & Leh • Starting ₹6,800",
        href: "/tours",
      },
      {
        title: "Bikat Adventures",
        image: "/adventures/act2.png",
        location: "Garhwal Alps • Starting ₹8,200",
        href: "/tours",
      },
      {
        title: "Great Indian Outdoors",
        image: "/adventures/act3.png",
        location: "Chopta & Kedarkantha • Starting ₹5,999",
        href: "/tours",
      },
      {
        title: "Himalayan Hikers",
        image: "/adventures/trk.png",
        location: "Sankri & Har Ki Dun • Starting ₹6,500",
        href: "/tours",
      },
      {
        title: "Renok Adventures",
        image: "/adventures/act4.png",
        location: "Roopkund & Kuari Pass • Starting ₹9,400",
        href: "/tours",
      },
      {
        title: "White Magic Adventure",
        image: "/adventures/trk.png",
        location: "Ladakh & Spiti • Starting ₹14,000",
        href: "/tours",
      },
      {
        title: "Altitude Treks India",
        image: "/adventures/act1.png",
        location: "Hampta Pass • Starting ₹7,200",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "White Water Rafting & River Camps",
    tabs: undefined,
    items: [
      {
        title: "Shivpuri River Rafting Co.",
        image: "/adventures/rft.png",
        location: "Shivpuri • Starting ₹600/D",
        href: "/tours",
      },
      {
        title: "Marine Drive Expeditions",
        image: "/adventures/act2.png",
        location: "Marine Drive • Starting ₹1,000/D",
        href: "/tours",
      },
      {
        title: "Kaudiyala Rapid Runners",
        image: "/adventures/act3.png",
        location: "Kaudiyala • Starting ₹1,500/D",
        href: "/tours",
      },
      {
        title: "Brahmapuri Family Rapids",
        image: "/adventures/rft.png",
        location: "Rishikesh • Starting ₹500/D",
        href: "/tours",
      },
      {
        title: "Byasi White Water Camp",
        image: "/adventures/act4.png",
        location: "Byasi • Starting ₹1,800/D",
        href: "/tours",
      },
      {
        title: "Teesta River Adventures",
        image: "/adventures/act1.png",
        location: "Sikkim • Starting ₹1,200/D",
        href: "/tours",
      },
      {
        title: "Kundalika White Water Rafting",
        image: "/adventures/rft.png",
        location: "Kolad • Starting ₹1,350/D",
        href: "/tours",
      },
      {
        title: "Zanskar River Expeditions",
        image: "/adventures/act2.png",
        location: "Ladakh • Starting ₹4,500/D",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Goa Coastal & Island Cruise Operators",
    tabs: undefined,
    items: [
      {
        title: "Goa Water Sports Club",
        image: "/adventures/act3.png",
        location: "Calangute • Starting ₹1,200/person",
        href: "/tours",
      },
      {
        title: "Grand Island Scuba Dive Co.",
        image: "/adventures/act4.png",
        location: "Panaji • Starting ₹2,800/person",
        href: "/tours",
      },
      {
        title: "Mandovi Sunset Cruise Co.",
        image: "/adventures/act1.png",
        location: "Mandovi River • Starting ₹600/person",
        href: "/tours",
      },
      {
        title: "Dudhsagar Jeep Safari Co.",
        image: "/adventures/act2.png",
        location: "Mollem • Starting ₹1,500/person",
        href: "/tours",
      },
      {
        title: "South Goa Dolphin Tours",
        image: "/adventures/act3.png",
        location: "Palolem • Starting ₹500/person",
        href: "/tours",
      },
      {
        title: "Atlantis Water Sports",
        image: "/adventures/act4.png",
        location: "Baga Beach • Starting ₹1,800/person",
        href: "/tours",
      },
      {
        title: "Champions Yacht Club",
        image: "/adventures/act1.png",
        location: "Mayem Lake • Starting ₹3,200/person",
        href: "/tours",
      },
      {
        title: "Goa Kayaking Expeditions",
        image: "/adventures/act2.png",
        location: "Zuari River • Starting ₹900/person",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Cultural Heritage & City Walking Tours",
    tabs: undefined,
    items: [
      {
        title: "Jaipur Heritage Walks",
        image: "/hotels/img5.png",
        location: "Jaipur • Starting ₹750/person",
        href: "/tours",
      },
      {
        title: "Udaipur Royal Palace Tours",
        image: "/hotels/img6.png",
        location: "Udaipur • Starting ₹1,100/person",
        href: "/tours",
      },
      {
        title: "Old Delhi Food & Bazaar Tour",
        image: "/hotels/img7.png",
        location: "Delhi • Starting ₹950/person",
        href: "/tours",
      },
      {
        title: "Varanasi Ghats Morning Boat",
        image: "/hotels/img8.png",
        location: "Varanasi • Starting ₹600/person",
        href: "/tours",
      },
      {
        title: "Hampi Ruins Guided Trails",
        image: "/hotels/img5.png",
        location: "Hampi • Starting ₹1,200/person",
        href: "/tours",
      },
      {
        title: "Mysore Palace & Silk Trails",
        image: "/hotels/img6.png",
        location: "Mysore • Starting ₹800/person",
        href: "/tours",
      },
      {
        title: "Kochi Fort & Colonial Walk",
        image: "/hotels/img7.png",
        location: "Kochi • Starting ₹700/person",
        href: "/tours",
      },
      {
        title: "Amritsar Golden Temple Heritage",
        image: "/hotels/img8.png",
        location: "Amritsar • Starting ₹550/person",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Wildlife Safaris & Nature Reserves",
    tabs: undefined,
    items: [
      {
        title: "Jim Corbett Jungle Safaris",
        image: "/adventures/act1.png",
        location: "Corbett • Starting ₹4,500/jeep",
        href: "/tours",
      },
      {
        title: "Ranthambore Tiger Tours",
        image: "/adventures/act2.png",
        location: "Sawai Madhopur • Starting ₹3,800/jeep",
        href: "/tours",
      },
      {
        title: "Kaziranga Elephant Safaris",
        image: "/adventures/act3.png",
        location: "Assam • Starting ₹2,200/person",
        href: "/tours",
      },
      {
        title: "Gir Forest Lion Tracking",
        image: "/adventures/act4.png",
        location: "Sasan Gir • Starting ₹4,200/jeep",
        href: "/tours",
      },
      {
        title: "Bandhavgarh Tiger Safari",
        image: "/adventures/act1.png",
        location: "Umaria • Starting ₹5,000/jeep",
        href: "/tours",
      },
      {
        title: "Periyar Wildlife Boat Safari",
        image: "/adventures/act2.png",
        location: "Thekkady • Starting ₹750/person",
        href: "/tours",
      },
      {
        title: "Sundarbans Delta Tours",
        image: "/adventures/act3.png",
        location: "West Bengal • Starting ₹3,500/person",
        href: "/tours",
      },
      {
        title: "Kabini Jungle Lodge Safaris",
        image: "/adventures/act4.png",
        location: "Nagarhole • Starting ₹4,800/person",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Spiritual Journeys & Pilgrimage Expeditions",
    tabs: undefined,
    items: [
      {
        title: "Char Dham Yatra Travels",
        image: "/hotels/img5.png",
        location: "Haridwar • Starting ₹18,500/person",
        href: "/tours",
      },
      {
        title: "Kedarnath Helicopter & Trek Co.",
        image: "/hotels/img6.png",
        location: "Guptkashi • Starting ₹9,800/person",
        href: "/tours",
      },
      {
        title: "Amarnath Pilgrimage Tours",
        image: "/hotels/img7.png",
        location: "Baltal • Starting ₹12,000/person",
        href: "/tours",
      },
      {
        title: "Vaishno Devi Express Travels",
        image: "/hotels/img8.png",
        location: "Katra • Starting ₹3,200/person",
        href: "/tours",
      },
      {
        title: "Tirupati Balaji Darshan Travels",
        image: "/hotels/img5.png",
        location: "Chennai / Tirupati • Starting ₹2,400",
        href: "/tours",
      },
      {
        title: "Dwarka Somnath Circuit Co.",
        image: "/hotels/img6.png",
        location: "Gujarat • Starting ₹7,200/person",
        href: "/tours",
      },
      {
        title: "Shirdi Sai Yatra Packages",
        image: "/hotels/img7.png",
        location: "Pune / Shirdi • Starting ₹1,900",
        href: "/tours",
      },
      {
        title: "Golden Triangle Spiritual Tour",
        image: "/hotels/img8.png",
        location: "Delhi / Agra • Starting ₹8,500",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Paragliding & High Altitude Adventures",
    tabs: undefined,
    items: [
      {
        title: "Bir Billing Paragliding Club",
        image: "/adventures/pg.png",
        location: "Bir Billing • Starting ₹2,800/flight",
        href: "/tours",
      },
      {
        title: "Solang Valley Aero Sports",
        image: "/adventures/bj.png",
        location: "Manali • Starting ₹1,800/flight",
        href: "/tours",
      },
      {
        title: "Kamshet Paragliding School",
        image: "/adventures/pg.png",
        location: "Kamshet • Starting ₹3,200/session",
        href: "/tours",
      },
      {
        title: "Nainital Adventure Aero Club",
        image: "/adventures/bj.png",
        location: "Nainital • Starting ₹2,200/flight",
        href: "/tours",
      },
      {
        title: "Yelagiri Paragliding Association",
        image: "/adventures/pg.png",
        location: "Tamil Nadu • Starting ₹2,500/flight",
        href: "/tours",
      },
      {
        title: "Vagamon Sky Riders",
        image: "/adventures/bj.png",
        location: "Kerala • Starting ₹3,500/flight",
        href: "/tours",
      },
      {
        title: "Saputara Aero Club",
        image: "/adventures/pg.png",
        location: "Gujarat • Starting ₹1,900/flight",
        href: "/tours",
      },
      {
        title: "Shillong Sky Adrenaline",
        image: "/adventures/bj.png",
        location: "Meghalaya • Starting ₹3,000/flight",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Sponsored Travel Operators",
    tabs: undefined,
    items: [
      {
        title: "Secure Path Tours",
        image: "/bikes/cc1.png",
        location: "Starting From ₹600/D",
        href: "/tours",
      },
      {
        title: "Omni Point Travels",
        image: "/bikes/cc2.png",
        location: "Starting From ₹850/D",
        href: "/tours",
      },
      {
        title: "Global Track Adventures",
        image: "/bikes/cc3.png",
        location: "Starting From ₹1,100/D",
        href: "/tours",
      },
      {
        title: "Trace Tech Expeditions",
        image: "/bikes/cc4.png",
        location: "Starting From ₹950/D",
        href: "/tours",
      },
      {
        title: "Apex Wanderlust Co.",
        image: "/bikes/cc1.png",
        location: "Starting From ₹700/D",
        href: "/tours",
      },
      {
        title: "Zenith Escapes",
        image: "/bikes/cc2.png",
        location: "Starting From ₹1,250/D",
        href: "/tours",
      },
      {
        title: "Vanguard Voyagers",
        image: "/bikes/cc3.png",
        location: "Starting From ₹900/D",
        href: "/tours",
      },
      {
        title: "Horizon Trekkers",
        image: "/bikes/cc4.png",
        location: "Starting From ₹1,400/D",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
  {
    type: "tours",
    tagline: "Organic Ranks & Top Verified Operators",
    tabs: undefined,
    items: [
      {
        title: "Everest Trail Expeditions",
        image: "/adventures/act1.png",
        location: "Starting From ₹8,500",
        href: "/tours",
      },
      {
        title: "Rohtang Pass Tour Co.",
        image: "/adventures/act2.png",
        location: "Starting From ₹2,400",
        href: "/tours",
      },
      {
        title: "Spiti Valley Motorbike Tours",
        image: "/adventures/act3.png",
        location: "Starting From ₹16,000",
        href: "/tours",
      },
      {
        title: "Kerala Backwater Kayakers",
        image: "/adventures/act4.png",
        location: "Starting From ₹1,800",
        href: "/tours",
      },
      {
        title: "Rajasthan Camel Desert Safari",
        image: "/adventures/act1.png",
        location: "Starting From ₹1,500",
        href: "/tours",
      },
      {
        title: "Andaman Snorkel & Dive Tours",
        image: "/adventures/act2.png",
        location: "Starting From ₹3,200",
        href: "/tours",
      },
      {
        title: "Meghalaya Living Roots Trek",
        image: "/adventures/act3.png",
        location: "Starting From ₹4,500",
        href: "/tours",
      },
      {
        title: "Coorg Plantation & Coffee Trails",
        image: "/adventures/act4.png",
        location: "Starting From ₹1,100",
        href: "/tours",
      },
    ],
    isLoading: false,
  },
];

// ─── TourCarouselManager Design Class ──────────────────────────────
export interface CarouselConfig {
  initialCount: number;
  increment: number;
  triggerOffset: number;
  bannerPositions: Record<number, "A" | "B" | "C">;
}

export class TourCarouselManager {
  readonly initialCount: number;
  readonly increment: number;
  readonly triggerOffset: number;
  readonly bannerPositions: Record<number, "A" | "B" | "C">;

  constructor(config?: Partial<CarouselConfig>) {
    this.initialCount = config?.initialCount ?? 8;
    this.increment = config?.increment ?? 4;
    this.triggerOffset = config?.triggerOffset ?? 2;
    this.bannerPositions = config?.bannerPositions ?? {
      2: "A",
      5: "B",
      8: "C",
    };
  }

  getBannerRank(index: number): "A" | "B" | "C" | undefined {
    return this.bannerPositions[index];
  }

  getNextVisibleCount(currentCount: number, totalCount: number): number {
    return Math.min(totalCount, currentCount + this.increment);
  }

  getTriggerIndex(visibleCount: number, totalCount: number): number {
    if (visibleCount >= totalCount) return -1;
    return Math.max(0, visibleCount - this.triggerOffset - 1);
  }
}

// Singleton manager instance for Tours MainFramePage
const tourCarouselManager = new TourCarouselManager({
  initialCount: 8,
  increment: 4,
  triggerOffset: 2,
});

const MainFramePage = ({
  className,
  type,
  popularTrends,
}: HotelFramePageProps) => {
  const { data: tourCompaniesData, isLoading: isCompaniesLoading } =
    useGetTourCompanies();

  const companies = useMemo(() => {
    return (tourCompaniesData?.data || []) as TourCompanyItem[];
  }, [tourCompaniesData]);

  // Group companies by city
  const companiesByCity = useMemo(() => {
    if (!companies || companies.length === 0) return {};

    return companies.reduce((acc: Record<string, TourCompanyItem[]>, comp) => {
      const rawCity = comp.city || comp.location?.city || "Rishikesh";
      const city = rawCity.trim();
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(comp);
      return acc;
    }, {});
  }, [companies]);

  // Generate dynamic carousels for each available city with real data
  const cityCarousels = useMemo(() => {
    const availableCities = Object.keys(companiesByCity);

    return availableCities.map((city) => {
      const cityCompanies = companiesByCity[city] || [];
      const items: Item[] = cityCompanies.map((comp) => {
        const logoImg =
          comp.thumbnail ||
          comp.image ||
          comp.logo ||
          (comp.images && comp.images[0]?.url) ||
          (typeof comp.images?.[0] === "string" ? comp.images[0] : null) ||
          `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(comp.name)}`;

        const ratingVal =
          typeof (comp as any).rating?.average === "number"
            ? (comp as any).rating.average
            : typeof (comp as any).rating === "number"
              ? (comp as any).rating
              : 0;
        const reviewsCountVal =
          typeof (comp as any).numReviews === "number"
            ? (comp as any).numReviews
            : ((comp as any).rating?.count ?? 0);

        return {
          title: comp.name,
          location: `${city}, India`,
          price: comp.startingPrice || 999,
          rating: ratingVal,
          numReviews: reviewsCountVal,
          amenities: (comp as any).features?.length
            ? (comp as any).features.slice(0, 3)
            : ["Guided Tour", "Safety Gear", "Expert Guides"],
          image: logoImg,
          href: `/tours/${comp._id}`,
        };
      });

      return {
        key: `city-${city}`,
        tagline: `Top Tour Companies in ${city}`,
        items,
        icon: <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />,
        isLoading: false,
      };
    });
  }, [companiesByCity]);

  // Overall verified tour agencies carousel (featured top carousel)
  const featuredCarousel = useMemo(() => {
    if (!companies || companies.length === 0) return null;
    const items: Item[] = companies.map((comp) => {
      const logoImg =
        comp.thumbnail ||
        comp.image ||
        comp.logo ||
        (comp.images && comp.images[0]?.url) ||
        (typeof comp.images?.[0] === "string" ? comp.images[0] : null) ||
        `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(comp.name)}`;

      const ratingVal =
        typeof (comp as any).rating?.average === "number"
          ? (comp as any).rating.average
          : typeof (comp as any).rating === "number"
            ? (comp as any).rating
            : 0;
      const reviewsCountVal =
        typeof (comp as any).numReviews === "number"
          ? (comp as any).numReviews
          : ((comp as any).rating?.count ?? 0);

      return {
        title: comp.name,
        location: `${comp.city || comp.location?.city || "India"}`,
        price: comp.startingPrice || 1499,
        rating: ratingVal,
        numReviews: reviewsCountVal,
        amenities: (comp as any).features?.length
          ? (comp as any).features.slice(0, 3)
          : ["Guided Tour", "Safety Gear", "Expert Guides"],
        image: logoImg,
        href: `/tours/${comp._id}`,
      };
    });

    return {
      key: "featured-agencies",
      tagline: "Featured Tour Operators & Agencies",
      items,
      icon: <Compass className="h-3.5 w-3.5 shrink-0 text-primary" />,
      isLoading: isCompaniesLoading,
    };
  }, [companies, isCompaniesLoading]);

  // Build unified carousel list: featured + real city carousels + curated dummy carousels
  const allCarousels = useMemo(() => {
    const list: Array<{
      key: string;
      tagline: string;
      items: Item[];
      icon?: React.ReactNode;
      isLoading?: boolean;
    }> = [];

    // 1. Featured real carousel if exists
    if (featuredCarousel) {
      list.push(featuredCarousel);
    }

    // 2. Real city carousels
    cityCarousels.forEach((c) => {
      if (c.items.length > 0) list.push(c);
    });

    // 3. Curated dummy carousels (filter out any city already covered by real data)
    const coveredCities = new Set(
      Object.keys(companiesByCity).map((c) => c.toLowerCase()),
    );

    DummyTourDataList.forEach((dummy, idx) => {
      const isCitySection =
        dummy.tagline.toLowerCase().includes("rishikesh") &&
        coveredCities.has("rishikesh");
      if (!isCitySection) {
        list.push({
          key: `dummy-${idx}-${dummy.tagline}`,
          tagline: dummy.tagline,
          items: dummy.items as Item[],
          icon:
            idx % 2 === 0 ? (
              <Mountain className="h-3 w-3 shrink-0" />
            ) : (
              <MapPin className="h-3 w-3 shrink-0" />
            ),
          isLoading: false,
        });
      }
    });

    return list;
  }, [featuredCarousel, cityCarousels, companiesByCity]);

  // ── Progressive Rendering (Watermelon UI Flow) ──────────────────────
  // Initial count is 8 carousels
  const [visibleCount, setVisibleCount] = useState<number>(tourCarouselManager.initialCount);

  // Sync / clamp visible count when list size changes
  useEffect(() => {
    if (!isCompaniesLoading && allCarousels.length > 0) {
      setVisibleCount((prev) =>
        prev > tourCarouselManager.initialCount
          ? Math.min(allCarousels.length, prev)
          : Math.min(allCarousels.length, tourCarouselManager.initialCount)
      );
    }
  }, [allCarousels.length, isCompaniesLoading]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      tourCarouselManager.getNextVisibleCount(prev, allCarousels.length)
    );
  }, [allCarousels.length]);

  // Sentinel / Intersection trigger index:
  // For visibleCount = 8, triggerIndex is index 5 (the 6th carousel).
  // When scrolled into view, it seamlessly renders 4 more carousels!
  const triggerIndex = tourCarouselManager.getTriggerIndex(
    visibleCount,
    allCarousels.length
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      if (node && triggerIndex >= 0) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadMore();
            }
          },
          {
            rootMargin: "300px 0px",
            threshold: 0.1,
          }
        );
        observerRef.current.observe(node);
      }
    },
    [triggerIndex, loadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const renderedCarousels = useMemo(() => {
    return allCarousels.slice(0, visibleCount);
  }, [allCarousels, visibleCount]);

  const hasMoreToLoad = visibleCount < allCarousels.length;

  return (
    <FrameColursals className={cn(className, "w-full space-y-6 sm:space-y-8")}>
      {renderedCarousels.map((carousel, i) => {
        const bannerRank = tourCarouselManager.getBannerRank(i);
        const isTrigger = i === triggerIndex;

        return (
          <React.Fragment key={carousel.key}>
            <div ref={isTrigger ? triggerNodeRef : undefined} className="w-full">
              <PopularDestinationCarousel
                tagline={carousel.tagline}
                type={type || "tours"}
                items={carousel.items}
                isLoading={carousel.isLoading || false}
                icon={carousel.icon || <MapPin className="h-3 w-3 shrink-0" />}
                galleryCardHide={false}
              />
            </div>

            {/* Ranked Banner after specific carousel positions (gap of 3 carousels) */}
            {bannerRank && <RankedBanner rank={bannerRank} entityType="tour" />}
          </React.Fragment>
        );
      })}

      {/* Subtle progressive loading indicator */}
      {hasMoreToLoad && (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading more adventures...</span>
        </div>
      )}
    </FrameColursals>
  );
};

export default MainFramePage;
