import { axiosApi } from "@/lib/axios";
import { Hotel } from "@/types";
import { CompanyType } from "@/app/(home)/(categories)/_componentsRoot_categories/reviews";
import { toast } from "sonner";

export const getHotelReviews = async (
  companyId: string,
  CompanyType: CompanyType,
) => {
  try {
    const res = await axiosApi.get(`/reviews/${CompanyType}/${companyId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const HotelsSearch = async ({
  destination,
  checkIn,
  checkOut,
  adults = 1,
  children = 0,
}: {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  adults: number;
  children: number;
}) => {
  try {
    const res = await axiosApi.get(`/hotels/search`, {
      params: {
        destination,
        checkIn,
        checkOut,
        adults,
        children,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};

export const getHotelPolicies = async (id: string) => {
  try {
    const res = await axiosApi.get(`/policies/hotel/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};

export const getNewHotels = async () => {
  try {
    const res = await axiosApi.get("/hotels/home");
    return res.data || { success: true, count: 0, data: [] };
  } catch (error) {
    console.error("Error fetching home hotels:", error);
    return { success: false, count: 0, data: [] };
  }
};

export const getNearbyHotels = async (
  lat: number,
  lng: number,
  radius: number = 2000,
  limit: number = 50,
) => {
  try {
    const res = await axiosApi.get("/hotels/nearby", {
      params: { lat, lng, radius, limit },
    });
    return res.data || { success: true, count: 0, data: [] };
  } catch (error) {
    console.error("Error fetching nearby hotels:", error);
    return { success: false, count: 0, data: [] };
  }
};

export type RankedItem = {
  _id: string;
  name: string;
  city: string;
  image: string | null;
  rating?: number;
  numReviews?: number;
};

export type RankedResponse = {
  success: boolean;
  items: RankedItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export const getRankedHotels = async (rank: string, page: number = 1, limit: number = 10): Promise<RankedResponse> => {
  try {
    const res = await axiosApi.get("/hotels/ranked", {
      params: { rank, page, limit },
    });
    return res.data as RankedResponse;
  } catch (error) {
    console.error("Error fetching ranked hotels:", error);
    return { success: false, items: [], total: 0, page, limit, hasMore: false };
  }
};

import qs from "qs";
import { Filters } from "@/context/NuqsContentProvider";

export type HotelsResponse = {
  data: Hotel[];
  total: number;
  count: number;
};

export const getHotels = async (
  filters: Filters,
  page: number = 1,
  limit: number = 9,
): Promise<HotelsResponse> => {
  const params: Record<string, unknown> = { page, limit };

  const [minPrice, maxPrice] = filters.price ?? [0, 10];
  if (minPrice > 0) params.minPrice = minPrice;
  if (maxPrice > 0 && maxPrice < 10) params.maxPrice = maxPrice;

  if (filters.location?.length > 0) {
    params.city = filters.location[0];
  } else if ((filters as any).city) {
    params.city = (filters as any).city;
  }

  if (filters.score?.length > 0) {
    params.minRating = Math.min(...filters.score.map(Number));
  }

  const allAmenities = [
    ...(filters.amenities ?? []),
    ...(filters.essentials ?? []),
    ...(filters.features ?? []),
    ...(filters.onsite ?? []),
  ];
  if (allAmenities.length > 0) {
    params.amenities = allAmenities;
  }

  if (filters.roomSize?.length > 0) {
    params.maxSize = Math.max(...filters.roomSize.map(Number));
  }

  if ((filters as any).adults) {
    params.adults = (filters as any).adults;
  } else if (filters.Bedrooms?.length > 0) {
    params.adults = Math.max(...filters.Bedrooms);
  }

  if ((filters as any).children) {
    params.children = (filters as any).children;
  }

  if (filters.Beds?.length > 0) params.beds = Math.max(...filters.Beds);
  if (filters.Bathrooms?.length > 0)
    params.bathrooms = Math.max(...filters.Bathrooms);

  if ((filters as any).date?.checkIn)
    params.checkIn = (filters as any).date.checkIn;
  if ((filters as any).date?.checkOut)
    params.checkOut = (filters as any).date.checkOut;

  if (
    filters.typeOfPlace?.length > 0 &&
    !filters.typeOfPlace.includes("Any type")
  ) {
    params.typeOfPlace = filters.typeOfPlace;
  }

  const res = await axiosApi.get("/hotels", {
    params: {
      ...params,
      page,
      limit,
    },
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  });

  return {
    data: (res.data?.data ?? []) as Hotel[],
    total: res.data?.total ?? 0,
    count: res.data?.count ?? 0,
  };
};

export const getHotelsForSearch = async (val: Filters) => {
  const res = await axiosApi.get("/hotels", {
    params: val,
  });
  return res.data;
};

export const getHotelDetails = async (id: string) => {
  const response = await axiosApi.get(`/hotels/${id}`);
  return response.data?.data ?? response.data;
};

export const getHotelAvailability = async ({
  hotelId,
  checkIn,
  checkOut,
  adults,
  children,
}: {
  hotelId: string;
  checkIn?: Date;
  checkOut?: Date;
  adults: number;
  children: number;
}): Promise<Hotel> => {
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    throw new Error("Invalid Check-in or Check-out dates");
  }

  // Helper to format Date object to 'YYYY-MM-DD' without timezone shifts
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);

  const response = await axiosApi.get(`/hotels/${hotelId}/availability`, {
    params: {
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      adults,
      children,
    },
  });

  return (response.data?.data ?? response.data) as unknown as Hotel;
};

export type DestinationSuggestion = {
  type: "city" | "town" | "district" | "landmark" | "hotel";
  value: string;
  label: string;
  city?: string;
  state?: string;
  id?: string;
};

export const getDestinationSuggestions = async (
  query: string,
): Promise<DestinationSuggestion[]> => {
  try {
    const res = await axiosApi.get("/hotels/suggestions", {
      params: { q: query },
    });
    return (res.data?.data ?? []) as DestinationSuggestion[];
  } catch {
    return [];
  }
};

export const SearchCity = async (query: string) => {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`,
  );
  const data = await res.json();
  return data;
};
export const dotoggleLike = async (id: string, serviceType: string) => {
  try {
    const res = await axiosApi.post(`/favorites/toggle/${serviceType}/${id}`);
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
