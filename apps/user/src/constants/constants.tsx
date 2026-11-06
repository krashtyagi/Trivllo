// import { HotelCalender } from "@/app/(home)/hotels/[hotel]/_components/calander-booking";
import GuestSelector from "@/components/filter-bar/newui-selectedCounter";
import { LocationSuggestionDropdown } from "@/components/filter-bar/selectContent";
import HotelCalendern from "@/components/navbar/filter-nav-bar/calander05";
import { Icon } from "@tabler/icons-react";
import { Calendar, LucideProps, MapPin, PersonStanding, User, type LucideIcon } from "lucide-react";
import SearchInput from "./search-box-components/search-input";
import { useState } from "react";
export type type = "home" | "filter" | "profile" | "settings" | "payments";

export interface Pages {
  type: type;
  link: string;
  icon: LucideIcon;
  iconUrl?: string;
  title: string;
  filter_bar?: React.ReactNode;
  // home_filter_box?: React.ReactNode;
}

export type SelectItemOption = {
  value: string;
  label: string;
};

export type SelectGroupOption = {
  label: string;
  items: SelectItemOption[];
};

export const timeZoneOptions: SelectGroupOption[] = [
  {
    label: "North America",
    items: [
      { value: "est", label: "Eastern Standard Time" },
      { value: "cst", label: "Central Standard Time" },
      { value: "mst", label: "Mountain Standard Time" },
      { value: "pst", label: "Pacific Standard Time" },
      { value: "akst", label: "Alaska Standard Time" },
      { value: "hst", label: "Hawaii Standard Time" },
    ],
  },
  {
    label: "Europe & Africa",
    items: [
      { value: "gmt", label: "Greenwich Mean Time" },
      { value: "cet", label: "Central European Time" },
      { value: "eet", label: "Eastern European Time" },
      { value: "west", label: "Western European Summer Time" },
      { value: "cat", label: "Central Africa Time" },
      { value: "eat", label: "East Africa Time" },
    ],
  },
  {
    label: "Asia",
    items: [
      { value: "msk", label: "Moscow Time" },
      { value: "ist", label: "India Standard Time" },
      { value: "cst_china", label: "China Standard Time" },
      { value: "jst", label: "Japan Standard Time" },
      { value: "kst", label: "Korea Standard Time" },
      {
        value: "ist_indonesia",
        label: "Indonesia Central Standard Time",
      },
    ],
  },
  {
    label: "Australia & Pacific",
    items: [
      { value: "awst", label: "Australian Western Standard Time" },
      { value: "acst", label: "Australian Central Standard Time" },
      { value: "aest", label: "Australian Eastern Standard Time" },
      { value: "nzst", label: "New Zealand Standard Time" },
      { value: "fjt", label: "Fiji Time" },
    ],
  },
  {
    label: "South America",
    items: [
      { value: "art", label: "Argentina Time" },
      { value: "bot", label: "Bolivia Time" },
      { value: "brt", label: "Brasilia Time" },
      { value: "clt", label: "Chile Standard Time" },
    ],
  },
];
const items = [
  {
    id: 1,
    title: "Indore",
    subtitle: "Madhya Pradesh",
  },
  {
    id: 2,
    title: "Indira Nagar",
    subtitle: "Bengaluru, Karnataka",
  },
  {
    id: 3,
    title: "India",
  },
  {
    id: 4,
    title: "India Gate",
    subtitle: "New Delhi, Delhi",
  },
  {
    id: 5,
    title: "Indira Gandhi International Airport (DEL)",
    subtitle: "New Delhi",
  },
];
export type FilterBarValues = {
  value: string;
  description: string;
  element?: React.ReactNode;
  tagline?: string;
  // icon?:Icon;
};
export type BoxFilterBarVaues = {
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  element?: React.ReactNode;
  text: string;
}

export type SearchBoxValuesProps = {
  filterBlocks: BoxFilterBarVaues[],
  videos: {
    title: string
    description: string
    link: string
  }[]
}

export const HotelFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} />
    ),
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="hotels" />,
    tagline: "Choose your REST plans",
  },
  {
    value: "Who",
    description: "Add Guests",
    element: <GuestSelector />,
    tagline: "Who is coming?",
  },
];
export const BikesFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} />
    ),
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="bikes" />,
    tagline: "Choose your REST plans",
  },

];
export const CabsFilterBarValues: FilterBarValues[] = [
  {
    value: "Pickup Location",
    description: "Enter Pickup point",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} type="pickup" />
    ),
    tagline: "Where do you want to go?",
  },
  {
    value: "Drop Location",
    description: "Enter Destination",
    element: <LocationSuggestionDropdown items={items} onSelect={(item) => { }} type="dropoff" />,
    tagline: "Choose your REST plans",
  },
  {
    value: "When",
    description: "Add Date and Time",
    element: <HotelCalendern hookname="cabs" />,
    tagline: "Who is coming?",
  },
  {
    value: "Who",
    description: "Add Passengers",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} />
    ),
    tagline: "Who is coming?",
  },
];

export const ToursFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} />
    ),
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="tours" />,
    tagline: "Choose your REST plans",
  },
  {
    value: "Who",
    description: "Add Guests",
    element: <GuestSelector />,
    tagline: "Who is coming?",
  },
];
export const AdventuresFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: (
      <LocationSuggestionDropdown items={items} onSelect={(item) => { }} />
    ),
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="adventures" />,
    tagline: "Choose your REST plans",
  },
  {
    value: "Who",
    description: "Add Guests",
    element: <GuestSelector />,
    tagline: "Who is coming?",
  },
];


const HotelConstantsteste = () => {

  const [val_Hotel_Box_FilterBarValues, setHotel_Box_FilterBarValues] = useState<any>({

  });
  const Hotel_Box_FilterBarValues: BoxFilterBarVaues[] = [
    {
      label: "Check In",
      icon: Calendar,
      element: <HotelCalendern hookname="hotels" />,
      text: "Add dates",
    },
    {
      label: "Check Out",
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
  ];
  return {
    Hotel_Box_FilterBarValues,
    values: items
  }
}


export const Hotel_Box_FilterBarValues: BoxFilterBarVaues[] = [
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
];
export const Cabs_Box_FilterBarValues: BoxFilterBarVaues[] = [

  {
    label: "When",
    icon: Calendar,
    element: <HotelCalendern hookname="cabs" />,
    text: "Add dates",
  },
  {
    label: "Who",
    icon: User,
    element: <GuestSelector />,
    text: "Add Guests",
  },

];
export const Bikes_Box_FilterBarValues: BoxFilterBarVaues[] = [

  {
    label: "When",
    icon: Calendar,
    element: <HotelCalendern hookname="bikes" />,
    text: "Add dates",
  },


];
export const Tours_Box_FilterBarValues: BoxFilterBarVaues[] = [

  {
    label: "When",
    icon: Calendar,
    element: <HotelCalendern hookname="tours" />,
    text: "Add dates",
  },


];
export const Adventures_Box_FilterBarValues: BoxFilterBarVaues[] = [
  {
    label: "Check In",
    icon: Calendar,
    element: <HotelCalendern hookname="adventures" />,
    text: "Add dates",
  },

];

export const Search_box_values: SearchBoxValuesProps[] = [
  {

    filterBlocks: Hotel_Box_FilterBarValues,
    videos: [
      {
        title: "Capture the Joy.",
        description: "450+ vacation rentals, 120 local guides, and endless memories.",
        link: "/search-box-videos/happy.mp4"
      },
      {
        title: "The Open Road.",
        description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
        link: "/search-box-videos/road.mp4"
      },
      {
        title: "Reach New Heights.",
        description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
        link: "/search-box-videos/hot-air.mp4"
      }
    ]
  },
  {

    filterBlocks: Cabs_Box_FilterBarValues,
    videos: [
      {
        title: "Capture the Joy.",
        description: "450+ vacation rentals, 120 local guides, and endless memories.",
        link: "/search-box-videos/happy.mp4"
      },
      {
        title: "The Open Road.",
        description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
        link: "/search-box-videos/road.mp4"
      },
      {
        title: "Reach New Heights.",
        description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
        link: "/search-box-videos/hot-air.mp4"
      }
    ]
  },
  {

    filterBlocks: Bikes_Box_FilterBarValues,
    videos: [
      {
        title: "Capture the Joy.",
        description: "450+ vacation rentals, 120 local guides, and endless memories.",
        link: "/search-box-videos/happy.mp4"
      },
      {
        title: "The Open Road.",
        description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
        link: "/search-box-videos/road.mp4"
      },
      {
        title: "Reach New Heights.",
        description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
        link: "/search-box-videos/hot-air.mp4"
      }
    ]
  },
  {

    filterBlocks: Tours_Box_FilterBarValues,
    videos: [
      {
        title: "Capture the Joy.",
        description: "450+ vacation rentals, 120 local guides, and endless memories.",
        link: "/search-box-videos/happy.mp4"
      },
      {
        title: "The Open Road.",
        description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
        link: "/search-box-videos/road.mp4"
      },
      {
        title: "Reach New Heights.",
        description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
        link: "/search-box-videos/hot-air.mp4"
      }
    ]
  },
  {

    filterBlocks: Adventures_Box_FilterBarValues,
    videos: [
      {
        title: "Capture the Joy.",
        description: "450+ vacation rentals, 120 local guides, and endless memories.",
        link: "/search-box-videos/happy.mp4"
      },
      {
        title: "The Open Road.",
        description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
        link: "/search-box-videos/road.mp4"
      },
      {
        title: "Reach New Heights.",
        description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
        link: "/search-box-videos/hot-air.mp4"
      }
    ]
  }
]



























export const destinations: {
  title: string;
  location: string;
  image: string;
}[] = [
    {
      title: "Louvre Museum",
      location: "Paris, France",
      image: "/hotels/img1.png",
    },
    {
      title: "Golden Hands Bridge",
      location: "Da Nang, Vietnam",
      image: "/hotels/img2.png",
    },
    {
      title: "Elizabeth Tower",
      location: "London, England",
      image: "/hotels/img3.jpg",
    },
    {
      title: "Louvre Museum",
      location: "Paris, France",
      image: "/hotels/img4.png",
    },
    {
      title: "Golden Hands Bridge",
      location: "Da Nang, Vietnam",
      image: "/hotels/img1.png",
    },
    {
      title: "Elizabeth Tower",
      location: "London, England",
      image: "/hotels/img2.png",
    },
  ];
export const cars = [
  {
    title: "Tesla Model S",
    location: "California, USA",
    image: "https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg",
  },
  {
    title: "Lamborghini Aventador",
    location: "Sant'Agata Bolognese, Italy",
    image: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
  },
  {
    title: "BMW M4",
    location: "Munich, Germany",
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  },
  {
    title: "Tesla Model SS",
    location: "California, USA",
    image: "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg",
  },
  {
    title: "Lamborghini AventadorS",
    location: "Sant'Agata Bolognese, Italy",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
  },
  {
    title: "BMW M4S",
    location: "Munich, Germany",
    image: "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
  },
];
