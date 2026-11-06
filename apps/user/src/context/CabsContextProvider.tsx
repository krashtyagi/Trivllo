'use client'

import React, { useEffect, useState } from "react"
import {
    useQueryStates,
    parseAsArrayOf,
    parseAsString,
    parseAsInteger,
} from "nuqs"
import { useGetHotelsByFiltersDemo, useHotelSearch } from "@/services/hotel/querys"
import { CabService } from "@/types"
import { useHotelStore } from "@/store/hotel.store"
import { useNuqsContext } from "./NuqsContentProvider"
import { useCabsByFiltersDemo } from "@/services/cabs/cabs.queries"
import { useCabsStore } from "@/store/cabs.store"



type HotelContextProps = {

    cabs: CabService[]
    isLoading: boolean
    total: number
    wrap: boolean
    setWrap: (wrap: boolean) => void
    page: number
    setPage: (page: number) => void

}


const CabContext = React.createContext<HotelContextProps | null>(null)

export const CabsContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { filters, setFilters, page, setPage, wrap, setWrap } = useNuqsContext()

    const { guests, PickupCity, DropoffCity, date } = useCabsStore();
    function formatDate(dateValue: any) {
        if (!dateValue) return undefined;
        const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const combinedFilters = React.useMemo(() => ({
        ...filters,
        pickup: PickupCity,
        dropoff: DropoffCity,
        date: {
            checkIn: formatDate(date?.from),
            checkOut: formatDate(date?.to)
        }
    }), [filters, PickupCity, DropoffCity, date]);

    const debouncedFilters = useDebounce(combinedFilters, 1500)
    const debouncedPage = useDebounce(page, 1000)
    // console.log(guests, city, date);

    // const { data: d } = useHotelSearch({
    //   destination: city,
    //   checkIn: date?.from,
    //   checkOut: date?.to,
    //   adults: guests.adults,
    //   children: guests.children
    // })
    // const hotelss: Hotel[] = d?.data ?? []
    const { data, isLoading } = useCabsByFiltersDemo(debouncedFilters as any, debouncedPage)
    // const c = 
    const cabs: CabService[] = data?.data ?? []
    const total: number = data?.total ?? 0
    // console.log(, hotels);


    return (
        <CabContext.Provider value={{ cabs, isLoading, total, setWrap, wrap, page, setPage }}>
            {children}
        </CabContext.Provider>
    )
}

export const useCabsContext = () => {
    const ctx = React.useContext(CabContext)
    if (!ctx) {
        throw new Error("useCabsContext must be used inside CabsContextProvider")
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