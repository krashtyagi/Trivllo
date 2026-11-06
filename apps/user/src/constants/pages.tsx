
import { IconHome } from "@tabler/icons-react";

// import { Calendar05, PagesFilterBarButtons, SelectScrollable } from "@/pages/hotels/_components/filterbar/filter-bars";
import {
  AdventuresFilterBarValues,
  BikesFilterBarValues,
  CabsFilterBarValues,
  HotelFilterBarValues,
  ToursFilterBarValues,
  // Search_box_values,
  type Pages,
  type FilterBarValues,
} from "./constants";
import { PagesFilterBarButtons } from "@/components/filter-bar/filterBar";
import FilterBox from "@/components/filter-bar/fiter_box";
import { NavSearchDestination } from "@/components/filter-bar/nav-search-destination";
import HotelCalendern from "@/components/navbar/filter-nav-bar/calander05";
import GuestSelector from "@/components/filter-bar/newui-selectedCounter";
// import {
//   Calendar05,
//   PagesFilterBarButtons,
//   SelectScrollable,
// } from "../pages/hotels/_components/filterbar/filter-bars";
// export type FilterOfPagesProps = {
//   type:type
//   link: string;
//   element?: React.ReactNode;
//   title?: string;
//    icon: LucideIcon;
//     filter_bar?: React.ReactNode;
// };
// Nav-specific filter bar values: use inline NavSearchDestination for "Where"
const NavHotelFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: <NavSearchDestination />,
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="hotels" />,
    tagline: "Choose your dates",
  },
  {
    value: "Who",
    description: "Add Guests",
    element: <GuestSelector />,
    tagline: "Who is coming?",
  },
];

const NavToursFilterBarValues: FilterBarValues[] = [
  {
    value: "Where",
    description: "Search Destination",
    element: <NavSearchDestination />,
    tagline: "Where do you want to go?",
  },
  {
    value: "When",
    description: "Add dates",
    element: <HotelCalendern hookname="tours" />,
    tagline: "Choose your dates",
  },
  {
    value: "Who",
    description: "Add Guests",
    element: <GuestSelector />,
    tagline: "Who is coming?",
  },
];

export const FilterOfPages: Pages[] = [
  {
    type: "filter",
    link: "/hotels/find",
    title: "Filter Hotels",
    icon: IconHome,
    filter_bar: (
      <PagesFilterBarButtons PagesFilterBarValues={NavHotelFilterBarValues} type="home" category="hotels" />
    ),

  },
  // {
  //   type: "filter",
  //   link: "/bikes/find",
  //   title: "Filter Bikes",
  //   icon: IconHome,
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={BikesFilterBarValues} type="home" category="bikes" />
  //   ),

  // },
  // {
  //   type: "filter",
  //   link: "/cabs/find",
  //   title: "Filter Cabs",
  //   icon: IconHome,
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} type="home" category="cabs" />
  //   ),

  // },
  {
    type: "filter",
    link: "/tours/find",
    title: "Filter Tours",
    icon: IconHome,
    filter_bar: (
      <PagesFilterBarButtons PagesFilterBarValues={NavToursFilterBarValues} type="home" category="tours" />
    ),

  },
  // {
  //   type: "filter",
  //   link: "/adventures/find",
  //   title: "Filter Adventures",
  //   icon: IconHome,
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={AdventuresFilterBarValues} type="home" category="adventures" />
  //   ),

  // },

];
export const pages: Pages[] = [

  {
    type: "home",
    link: "/hotels",
    icon: IconHome,
    iconUrl: "/nav-icons/hotel-logo.png",
    title: "Hotels",
    filter_bar: (
      <PagesFilterBarButtons PagesFilterBarValues={HotelFilterBarValues} link="/hotels/find" type="home" />
    ),

  },
  // {
  //   type: "home",
  //   link: "/cabs",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/cabs-logo.png",
  //   title: "Cabs",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/cabs/find" type="home" />
  //   ),

  // },

  // {
  //   link: "/bikes",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/bikes-logo.png",
  //   title: "Bikes",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/bikes/find" type="home" />
  //   ),
  //   type: "home",

  // },

  {
    type: "home",
    link: "/tours",
    icon: IconHome,
    iconUrl: "/nav-icons/tours-logo.png",
    title: "Tours",
    filter_bar: (
      <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/tours/find" type="home" />
    ),

  },
  // {
  //   type: "home",
  //   link: "/adventures",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/adventures-logo.png",
  //   title: "Adventures",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/adventures/find" type="home" />
  //   ),

  // },
  // {
  //   type: "home",
  //   link: "/flights",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/flight-logo.png",
  //   title: "Flights",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/flights/find" type="home" />
  //   ),

  // },
  // {
  //   type: "home",
  //   link: "/buses",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/bus-logo.png",
  //   title: "Buses",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/buses/find" type="home" />
  //   ),

  // },
  // {
  //   type: "home",
  //   link: "/trains",
  //   icon: IconHome,
  //   iconUrl: "/nav-icons/train-logo.png",
  //   title: "Trains",
  //   filter_bar: (
  //     <PagesFilterBarButtons PagesFilterBarValues={CabsFilterBarValues} link="/trains/find" type="home" />
  //   ),

  // },
];
