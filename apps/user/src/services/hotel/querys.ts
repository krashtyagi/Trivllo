"use client";
import { currentUser } from "../user.service";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getHotels,
  getHotelAvailability,
  getHotelsForSearch,
  SearchCity,
  HotelsSearch,
  getNewHotels,
  getRankedHotels,
  getHotelDetails,
} from "./hotel.service";
import { getBookingById, getMyBookings } from "../booking/booking.service";
import { Filters } from "@/context/NuqsContentProvider";
import { CompanyType } from "@/app/(home)/(categories)/_componentsRoot_categories/reviews";
import { userAccessToken } from "@/types/auth";

export const useSearchCity = (query: string) => {
  return useQuery({
    queryKey: ["search_city", query],
    queryFn: () => SearchCity(query),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!query,
  });
};

export const useGetNewHotels = () => {
  return useQuery({
    queryKey: ["gethotels_home"],
    queryFn: () => getNewHotels(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useGetRankedHotels = (rank: string) => {
  return useInfiniteQuery({
    queryKey: ["ranked_hotels", rank],
    queryFn: ({ pageParam = 1 }) =>
      getRankedHotels(rank, pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasMore) return lastPage.page + 1;
      return undefined;
    },
    enabled: !!rank,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useGetHotelReviews = (
  companyId: string,
  CompanyType: CompanyType,
) => {
  return useQuery({
    queryKey: ["hotel_reviews", companyId, CompanyType],
    queryFn: async () => {
      const { getHotelReviews } = await import("./hotel.service");
      return getHotelReviews(companyId, CompanyType);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!companyId && !!CompanyType,
  });
};

export const useGetHotelPolicies = (id: string) => {
  return useQuery({
    queryKey: ["hotel_policies", id],
    queryFn: async () => {
      const { getHotelPolicies } = await import("./hotel.service");
      return getHotelPolicies(id);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useBookingByIdQuery = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["booking_by_id", id],
    queryFn: () => getBookingById(id),
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useMyBookingsQuery = () => {
  return useQuery({
    queryKey: ["my_bookings"],
    queryFn: () => getMyBookings(),
    staleTime: 200000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: currentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useHotelSearch = ({
  destination,
  checkIn,
  checkOut,
  adults,
  children,
}: {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  adults: number;
  children: number;
}) => {
  return useQuery({
    queryKey: [
      "hotel_search",
      destination,
      checkIn,
      checkOut,
      adults,
      children,
    ],
    queryFn: async () => {
      const res = await HotelsSearch({
        destination,
        checkIn,
        checkOut,
        adults,
        children,
      });
      return res?.data ?? res;
    },
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!destination && !!checkIn && !!checkOut,
  });
};

export const useGetHotelsByFiltersDemo = (val: Filters, page: number = 1) => {
  return useQuery({
    queryKey: ["hotels_by_params", val, page],
    queryFn: () => getHotels(val, page),
    staleTime: 3 * 1000, // 3 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useHotelsQuery = () => {
  return useQuery({
    queryKey: ["hotels"],
    queryFn: () =>
      getHotels({
        price: [0, 10],
        Bedrooms: [],
        Beds: [],
        Bathrooms: [],
        typeOfPlace: [],
        essentials: [],
        roomSize: [],
        onsite: [],
        features: [],
        amenities: [],
        roomsbeds: [],
        location: [],
        classification: [],
        score: [],
        distance: [],
      }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

export const useHotelDetailsQuery = (hotelId: string) => {
  return useQuery({
    queryKey: ["hotel_details", hotelId],
    queryFn: () => getHotelDetails(hotelId),
    enabled: !!hotelId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000,
  });
};

type AvailabilityParams = {
  hotelId: string;
  checkIn?: Date;
  checkOut?: Date;
  adults: number;
  children: number;
};

export const useHotelAvailabilityQuery = (
  params: AvailabilityParams,
  fetch: boolean,
  setFetch: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return useQuery({
    queryKey: [
      "hotel-availability",
      params.hotelId,
      params.checkIn?.toString(),
      params.checkOut?.toString(),
      params.adults,
      params.children,
    ],
    queryFn: async () => {
      try {
        const res = await getHotelAvailability(params);
        return res;
      } finally {
        setFetch(false);
      }
    },
    enabled: fetch && !!params.checkIn && !!params.checkOut,
    staleTime: 0,
  });
};
