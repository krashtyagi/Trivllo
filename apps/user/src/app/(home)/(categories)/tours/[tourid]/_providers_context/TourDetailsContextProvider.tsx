import { HotelImage } from "@/types";
import React, { useEffect, useState } from "react";


type Props = {
  tourid: string;
  children: React.ReactNode;
};
export interface ToursResponse {
  success: boolean;
  data: ToursData;
}

export interface ToursData {
  company: Company;
  services: TourService[];
}

export interface Company {
  companyId: string;
  name: string;
  description: string;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  images: HotelImage[];
  features: string[];
  isFavorite: boolean;
}

export interface TourService {
  serviceId: string;
  title: string;
  duration: string; // e.g., "2D/1N"
  price: number;
  totalPriceWithTax: number;
  taxPercentage: number;
  thumbnail: HotelImage;
  thumbnails?: HotelImage[];
  features: string[];
}
const HotelContext = React.createContext<{

} | null>(null);

const TourDetailsContextProvider = ({ tourid, children }: Props) => {

  const contextValue = React.useMemo(
    () => ({

    }),
    [
    ]
  );

  return (
    <HotelContext.Provider value={contextValue}>
      {children}
    </HotelContext.Provider>
  );
};

export default TourDetailsContextProvider;

export const useTourDetailsContext = () => {
  const context = React.useContext(HotelContext);
  if (!context) {
    throw new Error(
      "useTourDetailsContext must be used within TourDetailsContextProvider"
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