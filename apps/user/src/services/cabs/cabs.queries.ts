"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAllCabs,
  getCabCompanyDetails,
  getCabs,
  getCabServiceDetails,
} from "./cabs.service";
import { Filters } from "@/context/NuqsContentProvider";
export const useCabsByFiltersDemo = (val: Filters, page: number = 1) => {
  return useQuery({
    queryKey: ["cabs_by_params", val, page],

    queryFn: () => getCabs(val, page),

    staleTime: 30 * 1000, // 3 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
export const useGetAllCabsQuery = () => {
  return useQuery({
    queryKey: ["getAllCabs"],
    queryFn: () => getAllCabs(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const useGetCabServiceDetails = (id: string) => {
  return useQuery({
    queryKey: ["getCabServiceDetails", id],
    queryFn: () => getCabServiceDetails(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetCabServiceDetails = useGetCabServiceDetails;

export const useGetCabCompanyDetails = (id: string) => {
  return useQuery({
    queryKey: ["getCabCompanyDetails", id],
    queryFn: () => getCabCompanyDetails(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetCabCompanyDetails = useGetCabCompanyDetails;
