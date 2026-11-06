'use client'

import React, { useEffect, useState } from "react"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useGetHotelsByFiltersDemo, useHotelSearch } from "@/services/hotel/querys"
import { Bike, Hotel, HotelImage } from "@/types"
import { useNuqsContext } from "./NuqsContentProvider"
import { useHotelStore } from "@/store/hotel.store"
import { useGetBikesByFiltersDemo } from "@/services/bikes/bikes.queries"
import { useGetToursByFiltersDemo } from "@/services/tours/tours.queries"
import { useToursStore } from "@/store/tours.store"

type PriceTuple = [number, number]

export interface Company {
    companyId: string;
    name: string;
    city: string;
    rating: number;
}

export type Tour = {
    serviceId: string;
    title: string;
    destinations: string[];
    duration: string;
    price: number;
    totalPriceWithTax: number;
    taxPercentage: number;
    thumbnail: HotelImage;
    thumbnails?: HotelImage[];
    company: Company;
}

export interface Pagination {
    page: number;
    limit: number;
    count: number;
}

export interface TourResponse {
    success: boolean;
    data: {
        tours: Tour[];
        pagination: Pagination;
    };
}

type TourContextProps = {

    tours: Tour[]
    isLoading: boolean
    total: number
    page: number
    setPage: (page: number) => void

}

export const DEFAULT_PRICE: PriceTuple = [0, 100000]

const TourContext = React.createContext<TourContextProps | null>(null)

export const TourContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { filters, setFilters, page, setPage } = useNuqsContext()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const queryCity = searchParams.get("city")
    const { guests, city, setCity, date } = useToursStore();

    useEffect(() => {
        const normQuery = queryCity?.trim().toLowerCase()
        const normStore = city?.trim().toLowerCase()

        if (normQuery && normQuery !== normStore) {
            setCity(queryCity!.trim())
        } else if (!normQuery && normStore && pathname === "/tours/find") {
            const params = new URLSearchParams(searchParams.toString())
            params.set("city", normStore)
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }, [queryCity, city, setCity, pathname, router, searchParams])

    const activeCity = queryCity?.trim() || city

    function formatDate(dateValue: any) {
        if (!dateValue) return undefined;
        const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const combinedFilters = React.useMemo(() => ({
        ...filters,
        city: activeCity || (filters as any).city || (filters.location?.length > 0 ? filters.location[0] : ""),
        adults: guests.adults,
        children: guests.children,
        date: {
            checkIn: formatDate(date?.from),
            checkOut: formatDate(date?.to)
        }
    }), [filters, guests, activeCity, date]);
    const debouncedFilters = useDebounce(combinedFilters, 1500)
    const debouncedPage = useDebounce(page, 1000)

    const { data, isLoading } = useGetToursByFiltersDemo(debouncedFilters as any, debouncedPage)
    const tours: Tour[] = data?.data ?? []
    const total: number = data?.total ?? 0
    // console.log(, hotels);


    return (
        <TourContext.Provider value={{ tours, isLoading, total, page, setPage }}>
            {children}
        </TourContext.Provider>
    )
}

export const useTourContext = () => {
    const ctx = React.useContext(TourContext)
    if (!ctx) {
        throw new Error("useTourContext must be used inside TourContextProvider")
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