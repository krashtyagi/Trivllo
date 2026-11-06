'use client'

import React, { useEffect, useState } from "react"
import {
    useQueryStates,
    parseAsArrayOf,
    parseAsString,
    parseAsInteger,
} from "nuqs"
import { useGetHotelsByFiltersDemo, useHotelSearch } from "@/services/hotel/querys"
import { Bike } from "@/types"
import { useHotelStore } from "@/store/hotel.store"

type PriceTuple = [number, number]

export type Filters = {
    category?: string[]
    price: PriceTuple//
    Bedrooms: number[]//
    Beds: number[]//
    Bathrooms: number[]//
    typeOfPlace: string[]//
    essentials: string[]
    roomSize: string[]//
    onsite: string[]
    features: string[]
    amenities: string[]
    roomsbeds: string[]
    location: string[]//
    classification: string[]
    score: string[]
    distance: number[]
}

type NuqsContentContextProps = {
    filters: Filters
    setFilters: (
        value: Partial<Filters> | ((prev: Filters) => Partial<Filters>)
    ) => void

    page: number
    setPage: (page: number) => void
    wrap: boolean
    setWrap: (wrap: boolean) => void

}

export const DEFAULT_PRICE: PriceTuple = [0, 100000]

const NuqsContext = React.createContext<NuqsContentContextProps | null>(null)

export const NuqsContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [wrap, setWrap] = useState(false);
    const [queryFilters, setQueryFilters] = useQueryStates({
        price: parseAsArrayOf(parseAsInteger).withDefault(DEFAULT_PRICE),
        typeOfPlace: parseAsArrayOf(parseAsString).withDefault([]),
        Bedrooms: parseAsArrayOf(parseAsInteger).withDefault([]),
        Beds: parseAsArrayOf(parseAsInteger).withDefault([]),
        Bathrooms: parseAsArrayOf(parseAsInteger).withDefault([]),
        roomSize: parseAsArrayOf(parseAsString).withDefault([]),
        distance: parseAsArrayOf(parseAsInteger).withDefault([0]),
        amenities: parseAsArrayOf(parseAsString).withDefault([]),
        essentials: parseAsArrayOf(parseAsString).withDefault([]),
        features: parseAsArrayOf(parseAsString).withDefault([]),
        onsite: parseAsArrayOf(parseAsString).withDefault([]),
        roomsbeds: parseAsArrayOf(parseAsString).withDefault([]),
        location: parseAsArrayOf(parseAsString).withDefault([]),
        classification: parseAsArrayOf(parseAsString).withDefault([]),
        score: parseAsArrayOf(parseAsString).withDefault([]),
        page: parseAsInteger.withDefault(1),
    })

    const filters: Filters = {
        ...queryFilters,
        price:
            queryFilters.price.length === 2
                ? [queryFilters.price[0], queryFilters.price[1]]
                : DEFAULT_PRICE,
    }

    const page = queryFilters.page

    const setPage = (newPage: number) => {
        setQueryFilters((prev) => ({ ...prev, page: newPage }))
    }

    const setFilters: NuqsContentContextProps["setFilters"] = (value) => {
        const next =
            typeof value === "function" ? value(filters) : value

        // Reset to page 1 whenever filters change
        setQueryFilters((prev) => ({
            ...prev,
            ...next,
            page: 1,
        }))
    }






    return (
        <NuqsContext.Provider value={{ filters, setFilters, page, setPage, wrap, setWrap }}>
            {children}
        </NuqsContext.Provider>
    )
}

export const useNuqsContext = () => {
    const ctx = React.useContext(NuqsContext)
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