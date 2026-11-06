'use client'

import React, { useEffect, useState } from "react"

import { useGetHotelsByFiltersDemo, useHotelSearch } from "@/services/hotel/querys"
import { Bike, Hotel, HotelImage } from "@/types"
import { useNuqsContext } from "./NuqsContentProvider"
import { useHotelStore } from "@/store/hotel.store"
import { useGetBikesByFiltersDemo } from "@/services/bikes/bikes.queries"
import { useGetAdventuresSearch } from "@/services/adventures/adventures.queries"
import { useAdventureStore } from "@/store/adventure.store"

type PriceTuple = [number, number]

export interface Activity {
    _id: string;
    name: string;
    category: string;
    description: string;
    priceStart: number;
    city: string;
    features: string[];
    rating: number;
    reviews: number;
    images: HotelImage
}

export interface ActivityResponse {
    success: boolean;
    count: number;
    data: Activity[];
}
type AdventureContextProps = {

    adventures: Activity[]
    isLoading: boolean
    total: number
    page: number
    setPage: (page: number) => void

}

export const DEFAULT_PRICE: PriceTuple = [0, 100000]

const AdventureContext = React.createContext<AdventureContextProps | null>(null)

export const AdventureContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { filters, setFilters, page, setPage } = useNuqsContext()
    const { guests, city, date, category } = useAdventureStore();
    function formatDate(dateValue: any) {
        if (!dateValue) return undefined;
        const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const combinedFilters = React.useMemo(() => ({
        ...filters,
        city,
        category,
        // adults: guests.adults,
        // children: guests.children,
        date: {
            checkIn: formatDate(date?.from),
            checkOut: formatDate(date?.to)
        }
    }), [filters, guests, city, date]);
    const debouncedFilters = useDebounce(combinedFilters, 1500)
    const debouncedPage = useDebounce(page, 1000)


    const { data, isLoading } = useGetAdventuresSearch(debouncedFilters as any, debouncedPage)
    // const c =
    const adventures: Activity[] = data?.data ?? []
    const total: number = data?.total ?? 0
    // console.log(, hotels);


    return (
        <AdventureContext.Provider value={{ adventures, isLoading, total, page, setPage }}>
            {children}
        </AdventureContext.Provider>
    )
}

export const useAdventureContext = () => {
    const ctx = React.useContext(AdventureContext)
    if (!ctx) {
        throw new Error("useAdventureContext must be used inside AdventureContextProvider")
    }
    return ctx
}

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