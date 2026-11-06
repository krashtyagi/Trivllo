"use client";
import { useQuery } from "@tanstack/react-query";
import { property } from "./users.service";

export const useProperty = (params?: any) => {
  return useQuery({
    queryKey: ["property", params],
    queryFn: () => property(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};
