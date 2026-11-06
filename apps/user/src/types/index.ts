export type Categories = "hotels" | "cabs" | "adventures" | "tours" | "bikes";

export interface Tabs {
  name: string;
  title?: string;
  value?: string;
  content?: string | React.ReactNode;
}
/** Hotel / Tour images can be plain optimized URL strings or objects with url */
export type HotelImage = string | {
  url: string;
  public_id?: string;
  resource_type?: string;
  _id?: string;
  [key: string]: any;
};

export interface RoomType {
  _id: string;
  hotelId: string;
  name: string;

  taxPercentage: number;
  totalTax: number;
  totalPriceWithTax: number;

  description: string;
  basePrice: number;
  discountPrice: number;
  capacity: {
    adults: number;
    children: number;
  };
  beds: {
    quantity: number;
    type: string;
    _id: string;
  }[];
  bedType: string;
  roomSizeSqm: number;
  viewType: string;
  amenities: string[];
  images: string[];
  totalRooms: number;
  isActive: boolean;
  availableRooms: number;
  finalPrice: number;
  displayPrice?: number;
  totalPrice?: number;
  nights?: number;
  rating?: number;
  numReviews?: number;
}

export interface HotelAddress {
  buildingName?: string;
  doorNumber?: string;
  streetAddress?: string;
  areaName?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  landmark?: string;
  directions?: string;
  formattedAddress?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  placeId?: string;
  timeZone?: string;
}

export interface Hotel {
  _id: string;
  name: string;
  description: string;
  address: string | HotelAddress;
  city: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  thumbnail?: string;
  images: HotelImage[];
  amenities: string[];
  rating: number;
  numReviews: number;
  roomTypes: RoomType[];
  isFavorite: boolean;
}

export interface CityTrends {
  name: string;
  tagline: string;

  tabs?: Tabs[];
}
/**
 * Represents the rental company providing the service
 */
interface Company {
  companyId: string;
  name: string;
  city: string;
  rating: number;
}

/**
 * Represents the bike service details
 */
export interface Bike {
  serviceId: string;
  bikeName: string;
  bikeType: "scooter" | "motorcycle" | string; // Using a union type if types are known
  pricePerDay: number;
  totalPriceWithTax: number;
  taxPercentage: number;
  thumbnail: HotelImage; // URL
  company: Company;
}
export interface CabCompany {
  companyId: string;
  name: string;
  city: string;
  rating: number;
}

export interface CompanyTrivllo {
  companyId: string;
  name: string;
  city: string;
  rating: number;
}
export interface CabService {
  serviceId: string;
  title: string;
  carName: string;
  cabType: "sedan" | "suv" | "luxury" | string; // Literal types for better safety
  capacity: number;
  pickup: string;
  drop: string;
  distance: string;
  duration: string;
  price: number;
  totalPriceWithTax: number;
  taxPercentage: number;
  thumbnail: HotelImage;
  company: CabCompany;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  count: number;
}

export interface CabApiResponse {
  success: boolean;
  data: {
    cabs: CabService[];
    pagination: PaginationInfo;
  };
}
