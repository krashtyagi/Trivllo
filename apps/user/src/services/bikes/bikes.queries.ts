"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAllBikes,
  getBikeCompanyDetails,
  getBikeServiceDetails,
} from "./bikes.service";
import { Filters } from "@/context/NuqsContentProvider";
import { getBikes } from "./bikes.service";
export const useGetBikesByFiltersDemo = (val: Filters, page: number = 1) => {
  return useQuery({
    queryKey: ["bikes_by_params", val, page],

    queryFn: () => getBikes(val, page),

    staleTime: 30 * 1000, // 3 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useBilesCompanyDetailsQuery = (companyId: string) => {
  return useQuery({
    queryKey: ["BilesCompanyDetailsQuery", companyId],
    queryFn: () => getBikeCompanyDetails(companyId),
    enabled: !!companyId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,

    refetchOnReconnect: true,
    staleTime: 60 * 1000,
  });
};

export const useGetBikeServiceDetails = (id: string) => {
  return useQuery({
    queryKey: ["getBikeServiceDetails-12s", id],
    queryFn: () => getBikeServiceDetails(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usegetBikeServiceDetails = useGetBikeServiceDetails;

