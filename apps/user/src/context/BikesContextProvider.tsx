'use client'

import React, { useEffect, useState } from "react"

import { useGetHotelsByFiltersDemo, useHotelSearch } from "@/services/hotel/querys"
import { Bike, Hotel } from "@/types"
import { useNuqsContext } from "./NuqsContentProvider"
import { useHotelStore } from "@/store/hotel.store"
import { useGetBikesByFiltersDemo } from "@/services/bikes/bikes.queries"
import { useBikesStore } from "@/store/bikes.store"

type PriceTuple = [number, number]



type BikeContextProps = {

    bikes: Bike[]
    isLoading: boolean
    total: number
    page: number
    setPage: (page: number) => void

}

export const DEFAULT_PRICE: PriceTuple = [0, 100000]

const BikeContext = React.createContext<BikeContextProps | null>(null)

export const BikeContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { filters, setFilters, page, setPage } = useNuqsContext()
    const { guests, city, date } = useBikesStore();
    function formatDate(dateValue: any) {
        if (!dateValue) return undefined;
        const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const combinedFilters = React.useMemo(() => ({
        ...filters,
        city,
        // adults: guests.adults,
        // children: guests.children,
        date: {
            checkIn: formatDate(date?.from),
            checkOut: formatDate(date?.to)
        }
    }), [filters, guests, city, date]);
    const debouncedFilters = useDebounce(combinedFilters, 1500)
    const debouncedPage = useDebounce(page, 1000)


    const { data, isLoading } = useGetBikesByFiltersDemo(debouncedFilters as any, debouncedPage)
    // const c = 
    const bikes: Bike[] = data?.data ?? []
    const total: number = 0
    // console.log(, hotels);


    return (
        <BikeContext.Provider value={{ bikes, isLoading, total, page, setPage }}>
            {children}
        </BikeContext.Provider>
    )
}

export const useBikeContext = () => {
    const ctx = React.useContext(BikeContext)
    if (!ctx) {
        throw new Error("useBikeContext must be used inside BikeContextProvider")
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