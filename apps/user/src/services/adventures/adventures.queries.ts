"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAdventureCompanyDetails,
  getAdventureServiceDetails,
  getAllAdventures,
  getAllAdventuresSearch,
  getAvailableAdventures,
} from "./adventures.service";
import { Filters } from "@/context/NuqsContentProvider";
export const useGetAdventuresSearch = (val: Filters, page: number = 1) => {
  return useQuery({
    queryKey: ["adventures_by_params", val, page],

    queryFn: () => getAllAdventuresSearch(val, page),

    staleTime: 30 * 1000, // 3 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
export const useGetAvailableAdventures = (data: {
  city?: string;
  category?: string;
  date?: {
    checkIn: string;
    checkOut: string;
  };
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["getAvailableAdventures", data],
    queryFn: () => getAvailableAdventures(data),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetAvailableAdventures = useGetAvailableAdventures;

export const useGetAdventureServiceDetails = (id: string) => {
  return useQuery({
    queryKey: ["getAdventureServiceDetails", id],
    queryFn: () => getAdventureServiceDetails(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetAdventureServiceDetails = useGetAdventureServiceDetails;

export const useGetAdventureCompanyDetails = (id: string) => {
  return useQuery({
    queryKey: ["getAdventureCompanyDetails", id],
    queryFn: () => getAdventureCompanyDetails(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetAdventureCompanyDetails = useGetAdventureCompanyDetails;

