"use client";
import { useQuery } from "@tanstack/react-query";
import { adminDashboard, recentBookings } from "./dash.service";

export const useDashboard = () => {

  return useQuery({
    queryKey: ["admin_dashboard"],
    queryFn: adminDashboard,
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const useRecentBookings = () => {

  return useQuery({
    queryKey: ["recentBookings"],
    queryFn: recentBookings,
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};