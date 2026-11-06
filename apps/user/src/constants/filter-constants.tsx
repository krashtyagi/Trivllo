import {
  HotelCheckBoxGroupOfClassification,
  HotelCheckBoxGroupOfRoomSize,
  HotelCheckBoxGroupOfScore,
  HotelCounters,
  HotelDistanceFromCenter,
  HotelPileGroup,
  HotelPileGroupOfAmenities,
  HotelPileGroupOfEssentials,
  HotelPileGroupOfFeatures,
  HotelPileGroupOfLocation,
  HotelPileGroupOfOnsite,
  HotelPriceRange,
} from "@/components/side-bar-filter/hotel/HotelPileGroup";

import {
  AdventurePileGroupOfFeatures,
  AdventurePileGroupOfAmenities,
  AdventurePriceRange,
  AdventureCheckBoxGroupOfScore,
} from "@/components/side-bar-filter/adventure/AdventurePileGroup";

import {
  TourPileGroupOfFeatures,
  TourPileGroupOfAmenities,
  TourPriceRange,
  TourCheckBoxGroupOfScore,
} from "@/components/side-bar-filter/tour/TourPileGroup";

import {
  CabPileGroupOfFeatures,
  CabPileGroupOfAmenities,
  CabPriceRange,
  CabCheckBoxGroupOfScore,
} from "@/components/side-bar-filter/cab/CabPileGroup";

import {
  BikePileGroupOfFeatures,
  BikePileGroupOfAmenities,
  BikePriceRange,
  BikeCheckBoxGroupOfScore,
} from "@/components/side-bar-filter/bike/BikePileGroup";

import {
  FoodAndDrinks,
  ConnectivityAndBusiness,
  ComfortAndClimate,
  RulesAndAccess,
  Facilities,
  Locations,
  Transport,
  Family,
  TourFeatures,
  TourAmenities,
  AdventureFeatures,
  AdventureAmenities,
  CabFeatures,
  CabAmenities,
  BikeFeatures,
  BikeAmenities,
} from "@/components/ui/icons";

export type AcordionItemType = {
  value: string;
  trigger: string;
  content: React.ReactNode;
};

const guestScoreOptions = [
  { value: 5, label: "5.0+ Excellent" },
  { value: 4, label: "4.0+ Very Good" },
  { value: 3, label: "3.0+ Good" },
  { value: 2, label: "2.0+ Fair" },
  { value: 1, label: "1.0+ Poor" },
];

const classificationOptions = [
  { value: 5, label: "5 Star" },
  { value: 4, label: "4 Star" },
  { value: 3, label: "3 Star" },
  { value: 2, label: "2 Star" },
  { value: 1, label: "1 Star" },
];

const roomSizeOptions = [
  { value: 200, label: "Small (≤25 m²)" },
  { value: 500, label: "Medium (25-50 m²)" },
  { value: 1000, label: "Large (50-100 m²)" },
];

const hotelFilterOptions = {
  typeOfPlace: Family,
  amenities: ConnectivityAndBusiness,
  essentials: { ...ComfortAndClimate, ...RulesAndAccess },
  onsiteServices: Facilities,
  features: { ...FoodAndDrinks, ...Transport },
  location: Locations,
  roomsbeds: ["Bedrooms", "Beds", "Bathrooms"] as const,
  guest_score: guestScoreOptions,
  classification: classificationOptions,
  roomsize: roomSizeOptions,
};

export const hotelItems: AcordionItemType[] = [
  {
    value: "type",
    trigger: "Type of place",
    content: <HotelPileGroup values={hotelFilterOptions.typeOfPlace} />,
  },
  {
    value: "Price",
    trigger: "Price range",
    content: <HotelPriceRange />,
  },
  {
    value: "roomsbeds",
    trigger: "Rooms and beds",
    content: <HotelCounters values={hotelFilterOptions.roomsbeds} />,
  },
  {
    value: "Room size",
    trigger: "Room Size",
    content: (
      <HotelCheckBoxGroupOfRoomSize
        stars={false}
        values={hotelFilterOptions.roomsize}
      />
    ),
  },
  {
    value: "distance_center",
    trigger: "Distance from center",
    content: <HotelDistanceFromCenter />,
  },
  {
    value: "score",
    trigger: "Guest Review Score",
    content: (
      <HotelCheckBoxGroupOfScore
        stars={false}
        values={hotelFilterOptions.guest_score}
      />
    ),
  },
  {
    value: "clasification",
    trigger: "Property Classification",
    content: (
      <HotelCheckBoxGroupOfClassification
        stars={true}
        values={hotelFilterOptions.classification}
      />
    ),
  },
  {
    value: "amenities",
    trigger: "Amenities",
    content: (
      <HotelPileGroupOfAmenities values={hotelFilterOptions.amenities} />
    ),
  },
  {
    value: "essentials",
    trigger: "Essentials",
    content: (
      <HotelPileGroupOfEssentials values={hotelFilterOptions.essentials} />
    ),
  },
  {
    value: "onsite",
    trigger: "On-site Services",
    content: (
      <HotelPileGroupOfOnsite values={hotelFilterOptions.onsiteServices} />
    ),
  },
  {
    value: "features",
    trigger: "Features",
    content: (
      <HotelPileGroupOfFeatures values={hotelFilterOptions.features} />
    ),
  },
  {
    value: "location",
    trigger: "Location",
    content: (
      <HotelPileGroupOfLocation values={hotelFilterOptions.location} />
    ),
  },
];

export const items = hotelItems;

const adventureFilterOptions = {
  features: AdventureFeatures,
  amenities: AdventureAmenities,
  guest_score: guestScoreOptions,
};

export const adventureItems: AcordionItemType[] = [
  {
    value: "Price",
    trigger: "Price range",
    content: <AdventurePriceRange />,
  },
  {
    value: "score",
    trigger: "Review Score",
    content: (
      <AdventureCheckBoxGroupOfScore
        stars={false}
        values={adventureFilterOptions.guest_score}
      />
    ),
  },
  {
    value: "features",
    trigger: "Activity Types",
    content: (
      <AdventurePileGroupOfFeatures
        values={adventureFilterOptions.features}
      />
    ),
  },
  {
    value: "amenities",
    trigger: "Safety & Inclusions",
    content: (
      <AdventurePileGroupOfAmenities
        values={adventureFilterOptions.amenities}
      />
    ),
  },
];

const tourFilterOptions = {
  features: TourFeatures,
  amenities: TourAmenities,
  guest_score: guestScoreOptions,
};

export const tourItems: AcordionItemType[] = [
  {
    value: "Price",
    trigger: "Price range",
    content: <TourPriceRange />,
  },
  {
    value: "score",
    trigger: "Review Score",
    content: (
      <TourCheckBoxGroupOfScore
        stars={false}
        values={tourFilterOptions.guest_score}
      />
    ),
  },
  {
    value: "features",
    trigger: "Tour Types",
    content: (
      <TourPileGroupOfFeatures values={tourFilterOptions.features} />
    ),
  },
  {
    value: "amenities",
    trigger: "Inclusions & Amenities",
    content: (
      <TourPileGroupOfAmenities values={tourFilterOptions.amenities} />
    ),
  },
];

const cabFilterOptions = {
  features: CabFeatures,
  amenities: CabAmenities,
  guest_score: guestScoreOptions,
};

export const cabItems: AcordionItemType[] = [
  {
    value: "Price",
    trigger: "Price range",
    content: <CabPriceRange />,
  },
  {
    value: "score",
    trigger: "Driver Rating",
    content: (
      <CabCheckBoxGroupOfScore
        stars={false}
        values={cabFilterOptions.guest_score}
      />
    ),
  },
  {
    value: "features",
    trigger: "Vehicle Types",
    content: (
      <CabPileGroupOfFeatures values={cabFilterOptions.features} />
    ),
  },
  {
    value: "amenities",
    trigger: "Cab Amenities",
    content: (
      <CabPileGroupOfAmenities values={cabFilterOptions.amenities} />
    ),
  },
];

const bikeFilterOptions = {
  features: BikeFeatures,
  amenities: BikeAmenities,
  guest_score: guestScoreOptions,
};

export const bikeItems: AcordionItemType[] = [
  {
    value: "Price",
    trigger: "Price range",
    content: <BikePriceRange />,
  },
  {
    value: "score",
    trigger: "Rating",
    content: (
      <BikeCheckBoxGroupOfScore
        stars={false}
        values={bikeFilterOptions.guest_score}
      />
    ),
  },
  {
    value: "features",
    trigger: "Bike Types & Specs",
    content: (
      <BikePileGroupOfFeatures values={bikeFilterOptions.features} />
    ),
  },
  {
    value: "amenities",
    trigger: "Rental Inclusions",
    content: (
      <BikePileGroupOfAmenities values={bikeFilterOptions.amenities} />
    ),
  },
];