import React, { useEffect, useState } from "react";
import {
  useHotelAvailabilityQuery,
  useHotelDetailsQuery,
} from "@/services/hotel/querys";
import { useHotelStore } from "@/store/hotel.store";
import { Hotel, RoomType } from "@/types";

type Props = {
  hotelId: string;
  children: React.ReactNode;
};

const HotelContext = React.createContext<{
  rooms: RoomType[];
  allRooms?: RoomType[];
  maxGuests?: number;
  maxAdults?: number;
  maxChildren?: number;
  availabilityResponse: Hotel | undefined;
  availabilityLoading: boolean;
  FetchRoomTypes: () => void;
  fetch: boolean;
  setFetch: React.Dispatch<React.SetStateAction<boolean>>;
  refetchAvailability: () => void;
  isStale: boolean;
} | null>(null);

const HotelContextProvider = ({ hotelId, children }: Props) => {
  const [fetch, setFetch] = useState(false);
  // ✅ Zustand selectors (IMPORTANT)
  const rawDate = useHotelStore((s) => s.date);
  const guests = useHotelStore((s) => s.guests);
  // ✅ Normalize dates (localStorage persist stores them as strings)
  const date = React.useMemo(() => {
    if (!rawDate) return undefined;
    return {
      from: rawDate.from ? new Date(rawDate.from) : undefined,
      to: rawDate.to ? new Date(rawDate.to) : undefined,
    };
  }, [rawDate]);

  const isBookingMode = !!date?.from && !!date?.to;

  const [isStale, setIsStale] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // ✅ Auto-fetch availability when dates are available ONLY on initial mount/hydrate
  useEffect(() => {
    if (date?.from && date?.to) {
      if (!initialFetchDone) {
        setFetch(true);
        setInitialFetchDone(true);
        setIsStale(false);
      } else {
        setIsStale(true);
      }
    } else {
      setIsStale(true);
    }
  }, [date?.from?.getTime(), date?.to?.getTime(), guests.adults, guests.children]);

  useEffect(() => {
    if (fetch) {
      setIsStale(false);
    }
  }, [fetch]);

  // ✅ Memoize params
  const availabilityParams = React.useMemo(
    () => ({
      hotelId,
      checkIn: date?.from,
      checkOut: date?.to,
      adults: guests.adults,
      children: guests.children,
    }),
    [hotelId, date?.from, date?.to, guests.adults, guests.children]
  );


  const { data: hotelDetailsData } =
    useHotelDetailsQuery(hotelId);

  const {
    data: availabilityResponse,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useHotelAvailabilityQuery(availabilityParams, fetch, setFetch);

  const availabilityRooms = availabilityResponse?.roomTypes;

  const rooms =
    isBookingMode && availabilityRooms
      ? availabilityRooms
      : hotelDetailsData?.roomTypes || [];

  const allRooms = hotelDetailsData?.roomTypes || rooms || [];

  // Calculate max limit of guests across all rooms (e.g. rooms with capacities 3, 6, 2, 4 -> maxGuests = 6)
  const { maxGuests, maxAdults, maxChildren } = React.useMemo(() => {
    const list = allRooms && allRooms.length > 0 ? allRooms : rooms;
    if (!list || list.length === 0) {
      return { maxGuests: undefined, maxAdults: undefined, maxChildren: undefined };
    }

    const totalCapacities = list
      .map((r: any) => {
        if (typeof r.capacity === "number") return r.capacity;
        const adults = Number(r.capacity?.adults) || 0;
        const children = Number(r.capacity?.children) || 0;
        return adults + children || adults || 0;
      })
      .filter((c: number) => c > 0);

    const adultCapacities = list
      .map((r: any) => {
        if (typeof r.capacity === "number") return r.capacity;
        return Number(r.capacity?.adults) || 0;
      })
      .filter((c: number) => c > 0);

    const childCapacities = list
      .map((r: any) => {
        if (typeof r.capacity === "number") return 0;
        return Number(r.capacity?.children) || 0;
      })
      .filter((c: number) => c > 0);

    const maxG = totalCapacities.length > 0 ? Math.max(...totalCapacities) : undefined;
    const maxA = adultCapacities.length > 0 ? Math.max(...adultCapacities) : maxG;
    const maxC = childCapacities.length > 0 ? Math.max(...childCapacities) : maxG;

    return { maxGuests: maxG, maxAdults: maxA, maxChildren: maxC };
  }, [allRooms, rooms]);

  const contextValue = React.useMemo(
    () => ({
      availabilityResponse,
      availabilityLoading,
      FetchRoomTypes: refetchAvailability,
      refetchAvailability,
      rooms,
      allRooms,
      maxGuests,
      maxAdults,
      maxChildren,
      fetch,
      setFetch,
      isStale,
    }),
    [
      fetch,
      setFetch,
      availabilityResponse,
      availabilityLoading,
      refetchAvailability,
      rooms,
      allRooms,
      maxGuests,
      maxAdults,
      maxChildren,
      isStale,
    ]
  );

  return (
    <HotelContext.Provider value={contextValue}>
      {children}
    </HotelContext.Provider>
  );
};

export default HotelContextProvider;

export const useOptionalHotelContext = () => {
  return React.useContext(HotelContext);
};

export const useHotelContext = () => {
  const context = React.useContext(HotelContext);
  if (!context) {
    throw new Error(
      "useHotelContext must be used within HotelContextProvider"
    );
  }
  return context;
};
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)

    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}